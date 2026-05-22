const { getSupabaseAdmin } = require('../config/supabase');
const { ensureMedicalProfileForUser } = require('../services/profileService');
const crypto = require('crypto');

const TABLE = 'medical_documents';
const BUCKET = 'medical-documents';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

exports.listDocuments = async (req, res) => {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from(TABLE)
      .select('*')
      .eq('user_profile_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);

    return res.json({ documents: data || [] });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to load documents.' });
  }
};

exports.uploadDocument = async (req, res) => {
  try {
    const { fileName, fileType, fileBase64, category, notes } = req.body;

    if (!fileName || !fileBase64) {
      return res.status(400).json({ message: 'File name and content are required.' });
    }

    if (!ALLOWED_TYPES.includes(fileType)) {
      return res.status(400).json({ message: 'File type not allowed. Use JPEG, PNG, WebP or PDF.' });
    }

    // Decode base64
    const buffer = Buffer.from(fileBase64, 'base64');

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(400).json({ message: 'File too large. Maximum 10MB.' });
    }

    // Generate unique path
    const ext = fileName.split('.').pop() || 'pdf';
    const storagePath = `${req.user.id}/${crypto.randomBytes(8).toString('hex')}.${ext}`;

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

    // Save to database
    const { data, error: dbError } = await getSupabaseAdmin()
      .from(TABLE)
      .insert({
        user_profile_id: req.user.id,
        file_name: fileName,
        file_type: fileType,
        category: category || 'other',
        file_url: fileUrl,
        file_size: buffer.length,
        notes: notes || '',
      })
      .select('*')
      .single();

    if (dbError) throw new Error(dbError.message);

    return res.status(201).json({ message: 'Document uploaded.', document: data });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Unable to upload document.' });
  }
};

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
