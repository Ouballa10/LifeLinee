const { getSupabaseAdmin } = require('../config/supabase');
const { ensureMedicalProfileForUser } = require('../services/profileService');
const crypto = require('crypto');

const TABLE = 'medical_documents';
const BUCKET = 'medical-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const VALID_CATEGORIES = ['ordonnance', 'analyse', 'radio', 'certificat', 'compte_rendu', 'vaccination', 'other'];

/**
 * GET /documents
 * Supports: ?search=xxx&category=xxx&sortBy=date|name|size&sortOrder=asc|desc&page=1&limit=20
 */
exports.listDocuments = async (req, res) => {
  try {
    const {
      search = '',
      category = '',
      tag = '',
      sortBy = 'date',
      sortOrder = 'desc',
      page = '1',
      limit = '50',
    } = req.query;

    let query = getSupabaseAdmin()
      .from(TABLE)
      .select('*', { count: 'exact' })
      .eq('user_profile_id', req.user.id);

    // Filter by category
    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    // Search by file name or notes
    if (search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      query = query.or(`file_name.ilike.${searchTerm},notes.ilike.${searchTerm},tags.cs.{${search.trim()}}`);
    }

    // Filter by tag
    if (tag.trim()) {
      query = query.contains('tags', [tag.trim()]);
    }

    // Sorting
    const orderColumn = sortBy === 'name' ? 'file_name' : sortBy === 'size' ? 'file_size' : 'created_at';
    const ascending = sortOrder === 'asc';
    query = query.order(orderColumn, { ascending });

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) throw new Error(error.message);

    return res.json({
      documents: data || [],
      pagination: {
        page: pageNum,
        limit: pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to load documents.' });
  }
};

/**
 * GET /documents/stats
 * Returns document counts per category for the current user
 */
exports.getDocumentStats = async (req, res) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .select('category, file_size')
      .eq('user_profile_id', req.user.id);

    if (error) throw new Error(error.message);

    const stats = {
      total: data?.length || 0,
      totalSize: 0,
      byCategory: {},
    };

    (data || []).forEach((doc) => {
      const cat = doc.category || 'other';
      if (!stats.byCategory[cat]) {
        stats.byCategory[cat] = { count: 0, size: 0 };
      }
      stats.byCategory[cat].count += 1;
      stats.byCategory[cat].size += doc.file_size || 0;
      stats.totalSize += doc.file_size || 0;
    });

    return res.json({ stats });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to load document stats.' });
  }
};

/**
 * POST /documents/upload
 */
exports.uploadDocument = async (req, res) => {
  try {
    const { fileName, fileType, fileBase64, category, notes, tags } = req.body;

    if (!fileName || !fileBase64) {
      return res.status(400).json({ message: 'File name and content are required.' });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ message: 'File type not allowed. Use JPEG, PNG, WebP or PDF.' });
    }

    // Validate category
    const docCategory = VALID_CATEGORIES.includes(category) ? category : 'other';

    // Decode base64
    const buffer = Buffer.from(fileBase64, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ message: 'File too large. Maximum 10MB.' });
    }

    // Generate unique path organized by category
    const ext = fileName.split('.').pop() || 'pdf';
    const storagePath = `${req.user.id}/${docCategory}/${crypto.randomBytes(8).toString('hex')}.${ext}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await getSupabaseAdmin()
      .storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: fileType,
        upsert: false,
      });

    if (uploadError) throw new Error(uploadError.message);

    // Get public URL
    const { data: urlData } = getSupabaseAdmin()
      .storage
      .from(BUCKET)
      .getPublicUrl(storagePath);

    const fileUrl = urlData?.publicUrl || storagePath;

    // Parse tags
    const docTags = Array.isArray(tags)
      ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
      : String(tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);

    // Save to database
    const insertPayload = {
      user_profile_id: req.user.id,
      file_name: fileName,
      file_type: fileType,
      category: docCategory,
      file_url: fileUrl,
      file_size: buffer.length,
      notes: String(notes || '').trim(),
    };

    // Only add tags if the column exists (graceful)
    if (docTags.length > 0) {
      insertPayload.tags = docTags;
    }

    const { data, error: dbError } = await getSupabaseAdmin()
      .from(TABLE)
      .insert(insertPayload)
      .select('*')
      .single();

    if (dbError) throw new Error(dbError.message);

    return res.status(201).json({ message: 'Document uploaded.', document: data });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to upload document.' });
  }
};

/**
 * PUT /documents/:id
 * Update document metadata (name, category, notes, tags)
 */
exports.updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, category, notes, tags } = req.body;

    // Verify ownership
    const { data: doc, error: fetchError } = await getSupabaseAdmin()
      .from(TABLE)
      .select('id')
      .eq('id', id)
      .eq('user_profile_id', req.user.id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    const updates = {};
    if (fileName !== undefined) updates.file_name = String(fileName).trim();
    if (category !== undefined && VALID_CATEGORIES.includes(category)) updates.category = category;
    if (notes !== undefined) updates.notes = String(notes).trim();
    if (tags !== undefined) {
      updates.tags = Array.isArray(tags)
        ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean)
        : String(tags || '').split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No updates provided.' });
    }

    const { data, error: updateError } = await getSupabaseAdmin()
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (updateError) throw new Error(updateError.message);

    return res.json({ message: 'Document updated.', document: data });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to update document.' });
  }
};

/**
 * DELETE /documents/:id
 */
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Get document to find storage path
    const { data: doc, error: fetchError } = await getSupabaseAdmin()
      .from(TABLE)
      .select('*')
      .eq('id', id)
      .eq('user_profile_id', req.user.id)
      .single();

    if (fetchError || !doc) {
      return res.status(404).json({ message: 'Document not found.' });
    }

    // Delete from storage
    const storagePath = doc.file_url.split(`${BUCKET}/`).pop();
    if (storagePath) {
      await getSupabaseAdmin().storage.from(BUCKET).remove([storagePath]);
    }

    // Delete from database
    const { error: deleteError } = await getSupabaseAdmin()
      .from(TABLE)
      .delete()
      .eq('id', id);

    if (deleteError) throw new Error(deleteError.message);

    return res.json({ message: 'Document deleted.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to delete document.' });
  }
};

/**
 * POST /documents/bulk-delete
 * Delete multiple documents at once
 */
exports.bulkDeleteDocuments = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'Provide an array of document IDs.' });
    }

    // Get all docs to verify ownership and get storage paths
    const { data: docs, error: fetchError } = await getSupabaseAdmin()
      .from(TABLE)
      .select('*')
      .in('id', ids)
      .eq('user_profile_id', req.user.id);

    if (fetchError) throw new Error(fetchError.message);

    if (!docs || docs.length === 0) {
      return res.status(404).json({ message: 'No documents found.' });
    }

    // Delete from storage
    const storagePaths = docs
      .map((doc) => doc.file_url.split(`${BUCKET}/`).pop())
      .filter(Boolean);

    if (storagePaths.length > 0) {
      await getSupabaseAdmin().storage.from(BUCKET).remove(storagePaths);
    }

    // Delete from database
    const docIds = docs.map((d) => d.id);
    const { error: deleteError } = await getSupabaseAdmin()
      .from(TABLE)
      .delete()
      .in('id', docIds);

    if (deleteError) throw new Error(deleteError.message);

    return res.json({
      message: `${docIds.length} document(s) deleted.`,
      deletedCount: docIds.length,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to delete documents.' });
  }
};
