from __future__ import annotations

import html
import re
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FIGURES = DOCS / "figures"
REPORT_MD = DOCS / "rapport_pfe_lifeline.md"
OUT_DOCX = DOCS / "rapport_pfe_lifeline_word.docx"

EMU_PER_INCH = 914400


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def svg_text(x: int, y: int, text: str, size: int = 18, weight: str = "400", fill: str = "#172033") -> str:
    return f'<text x="{x}" y="{y}" font-family="Arial, Helvetica, sans-serif" font-size="{size}" font-weight="{weight}" fill="{fill}">{esc(text)}</text>'


def svg_box(x: int, y: int, w: int, h: int, fill: str, stroke: str = "#CBD5E1", rx: int = 12) -> str:
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="2"/>'


def save_svg(path: Path, width: int, height: int, body: str) -> None:
    path.write_text(
        f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}">
<rect width="100%" height="100%" fill="#F8FAFC"/>
{body}
</svg>''',
        encoding="utf-8",
    )


def make_phone_mockup(filename: str, title: str, subtitle: str, panels: list[tuple[str, str]], accent: str) -> None:
    body = []
    body.append(svg_box(80, 25, 250, 520, "#111827", "#111827", 34))
    body.append(svg_box(98, 52, 214, 466, "#FFFFFF", "#E5E7EB", 24))
    body.append(f'<circle cx="205" cy="39" r="5" fill="#374151"/>')
    body.append(svg_box(116, 75, 178, 92, accent, accent, 18))
    body.append(svg_text(132, 110, title, 22, "700", "#FFFFFF"))
    body.append(svg_text(132, 138, subtitle, 12, "400", "#E0F2FE"))
    y = 190
    for label, value in panels:
        body.append(svg_box(116, y, 178, 58, "#F8FAFC", "#E2E8F0", 14))
        body.append(svg_text(132, y + 24, label, 12, "700", "#475569"))
        body.append(svg_text(132, y + 45, value[:28], 13, "400", "#111827"))
        y += 76
    body.append(svg_box(140, 474, 130, 12, "#E5E7EB", "#E5E7EB", 8))
    save_svg(FIGURES / filename, 410, 570, "\n".join(body))


def make_figures() -> list[tuple[str, str, str]]:
    FIGURES.mkdir(parents=True, exist_ok=True)

    make_phone_mockup(
        "maquette_dashboard.svg",
        "LifeLine",
        "Tableau de bord",
        [
            ("Dossier medical", "Complet a 86%"),
            ("Groupe sanguin", "O+"),
            ("Actions", "QR, profil, scanner"),
            ("Etat", "Compte actif"),
        ],
        "#0F766E",
    )
    make_phone_mockup(
        "maquette_qr.svg",
        "QR Code",
        "Partage securise",
        [
            ("Token", "ll_xxxxx"),
            ("QR", "Image telechargeable"),
            ("Lien", "/emergency/:token"),
            ("Action", "Partager"),
        ],
        "#2563EB",
    )
    make_phone_mockup(
        "maquette_scanner.svg",
        "Scanner",
        "Lecture camera",
        [
            ("Camera", "Autoriser"),
            ("Scan", "Detection QR"),
            ("Import", "Image QR"),
            ("Resultat", "Redirection fiche"),
        ],
        "#7C3AED",
    )
    make_phone_mockup(
        "maquette_emergency.svg",
        "Urgence",
        "Fiche publique",
        [
            ("Sang", "O+"),
            ("Allergies", "Penicilline"),
            ("Contact", "Appeler"),
            ("Option", "Imprimer"),
        ],
        "#DC2626",
    )

    arch = []
    arch.append(svg_text(45, 48, "Architecture generale LifeLine", 28, "700", "#0F172A"))
    blocks = [
        (45, 100, "Utilisateur mobile", "React + Vite + PWA", "#DBEAFE"),
        (360, 100, "API Backend", "Node.js + Express", "#DCFCE7"),
        (675, 100, "Services externes", "Firebase Auth", "#FEF3C7"),
        (360, 300, "Base de donnees", "Supabase PostgreSQL", "#FCE7F3"),
    ]
    for x, y, title, sub, fill in blocks:
        arch.append(svg_box(x, y, 230, 110, fill, "#94A3B8", 18))
        arch.append(svg_text(x + 22, y + 45, title, 20, "700", "#0F172A"))
        arch.append(svg_text(x + 22, y + 76, sub, 15, "400", "#334155"))
    for x1, y1, x2, y2, label in [
        (275, 155, 360, 155, "HTTP/JSON"),
        (590, 155, 675, 155, "Token"),
        (475, 210, 475, 300, "CRUD"),
    ]:
        arch.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#0F172A" stroke-width="3" marker-end="url(#arrow)"/>')
        arch.append(svg_text(min(x1, x2) + 10, min(y1, y2) - 10, label, 13, "700", "#334155"))
    save_svg(
        FIGURES / "diagramme_architecture.svg",
        950,
        470,
        '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#0F172A"/></marker></defs>\n'
        + "\n".join(arch),
    )

    usecase = []
    usecase.append(svg_text(45, 45, "Diagramme de cas d'utilisation", 28, "700"))
    usecase.append(svg_text(55, 150, "Utilisateur", 18, "700"))
    usecase.append(svg_text(745, 150, "Secouriste", 18, "700"))
    for cx, cy, label in [
        (450, 100, "Creer un compte"),
        (450, 170, "Gerer profil medical"),
        (450, 240, "Generer QR code"),
        (450, 310, "Scanner QR"),
        (450, 380, "Consulter fiche urgence"),
    ]:
        usecase.append(f'<ellipse cx="{cx}" cy="{cy}" rx="170" ry="30" fill="#FFFFFF" stroke="#64748B" stroke-width="2"/>')
        usecase.append(svg_text(cx - 80, cy + 6, label, 15, "600"))
    for x1, y1, x2, y2 in [(165, 150, 280, 100), (165, 150, 280, 170), (165, 150, 280, 240), (730, 150, 620, 310), (730, 150, 620, 380)]:
        usecase.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#334155" stroke-width="2"/>')
    save_svg(FIGURES / "diagramme_usecase.svg", 900, 450, "\n".join(usecase))

    sequence = []
    sequence.append(svg_text(45, 45, "Sequence : consultation d'une fiche d'urgence", 26, "700"))
    actors = [(120, "Secouriste"), (330, "Frontend"), (540, "Backend"), (750, "Supabase")]
    for x, label in actors:
        sequence.append(svg_box(x - 70, 75, 140, 45, "#FFFFFF", "#94A3B8", 10))
        sequence.append(svg_text(x - 45, 104, label, 14, "700"))
        sequence.append(f'<line x1="{x}" y1="120" x2="{x}" y2="410" stroke="#CBD5E1" stroke-width="2" stroke-dasharray="7 7"/>')
    messages = [
        (120, 330, 160, "Scanne QR"),
        (330, 540, 220, "GET /emergency/:token"),
        (540, 750, 280, "Recherche profil public"),
        (750, 540, 325, "Donnees urgence"),
        (540, 330, 365, "JSON profile"),
    ]
    for x1, x2, y, label in messages:
        sequence.append(f'<line x1="{x1}" y1="{y}" x2="{x2}" y2="{y}" stroke="#0F172A" stroke-width="2" marker-end="url(#arrow)"/>')
        sequence.append(svg_text(min(x1, x2) + 18, y - 10, label, 13, "600"))
    save_svg(
        FIGURES / "diagramme_sequence.svg",
        900,
        450,
        '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#0F172A"/></marker></defs>\n'
        + "\n".join(sequence),
    )

    db = []
    db.append(svg_text(45, 45, "Schema conceptuel de la base de donnees", 26, "700"))
    tables = [
        (55, 95, "user_profiles", ["id", "firebase_uid", "full_name", "email", "phone", "city"]),
        (350, 95, "medical_profiles", ["id", "user_profile_id", "blood_type", "allergies", "medications", "qr_token"]),
        (645, 95, "emergency_logs", ["id", "qr_token", "responder", "location", "opened_at"]),
    ]
    for x, y, name, fields in tables:
        db.append(svg_box(x, y, 220, 250, "#FFFFFF", "#94A3B8", 12))
        db.append(svg_box(x, y, 220, 42, "#0F766E", "#0F766E", 12))
        db.append(svg_text(x + 18, y + 28, name, 16, "700", "#FFFFFF"))
        fy = y + 70
        for field in fields:
            db.append(svg_text(x + 18, fy, field, 14, "400", "#334155"))
            fy += 28
    db.append(f'<line x1="275" y1="220" x2="350" y2="220" stroke="#0F172A" stroke-width="3" marker-end="url(#arrow)"/>')
    db.append(svg_text(285, 205, "1 - 1", 13, "700"))
    db.append(f'<line x1="570" y1="260" x2="645" y2="260" stroke="#0F172A" stroke-width="3" marker-end="url(#arrow)"/>')
    db.append(svg_text(586, 245, "qr_token", 13, "700"))
    save_svg(
        FIGURES / "schema_base_donnees.svg",
        920,
        410,
        '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#0F172A"/></marker></defs>\n'
        + "\n".join(db),
    )

    return [
        ("diagramme_architecture.svg", "Figure 1 : Architecture generale de LifeLine.", "Chapitre 4"),
        ("diagramme_usecase.svg", "Figure 2 : Diagramme de cas d'utilisation.", "Chapitre 2"),
        ("diagramme_sequence.svg", "Figure 3 : Sequence de consultation d'une fiche d'urgence.", "Chapitre 6"),
        ("schema_base_donnees.svg", "Figure 4 : Schema conceptuel de la base de donnees.", "Chapitre 5"),
        ("maquette_dashboard.svg", "Figure 5 : Maquette du tableau de bord mobile.", "Chapitre 6"),
        ("maquette_qr.svg", "Figure 6 : Maquette de la page QR code.", "Chapitre 6"),
        ("maquette_scanner.svg", "Figure 7 : Maquette de la page scanner.", "Chapitre 6"),
        ("maquette_emergency.svg", "Figure 8 : Maquette de la fiche d'urgence publique.", "Chapitre 6"),
    ]


class DocxBuilder:
    def __init__(self) -> None:
        self.body: list[str] = []
        self.rels: list[str] = []
        self.media: list[Path] = []
        self.next_rid = 1
        self.figures_by_chapter: dict[str, list[tuple[str, str]]] = {}

    def add_paragraph(self, text: str = "", style: str | None = None, extra: str = "") -> None:
        style_xml = f'<w:pStyle w:val="{style}"/>' if style else ""
        self.body.append(
            f"<w:p>{'<w:pPr>' + style_xml + extra + '</w:pPr>' if style_xml or extra else ''}"
            f"<w:r><w:t xml:space=\"preserve\">{esc(text)}</w:t></w:r></w:p>"
        )

    def add_heading(self, text: str, level: int) -> None:
        style = "Title" if level == 1 else f"Heading{min(level - 1, 3)}"
        self.add_paragraph(text, style)

    def add_bullet(self, text: str) -> None:
        extra = '<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>'
        self.add_paragraph(text, "ListParagraph", extra)

    def add_page_break(self) -> None:
        self.body.append('<w:p><w:r><w:br w:type="page"/></w:r></w:p>')

    def add_caption(self, text: str) -> None:
        self.add_paragraph(text, "Caption")

    def add_image(self, path: Path, caption: str, width_in: float = 5.8, height_in: float | None = None) -> None:
        rid = f"rId{self.next_rid}"
        self.next_rid += 1
        self.media.append(path)
        self.rels.append(
            f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{path.name}"/>'
        )
        cx = int(width_in * EMU_PER_INCH)
        cy = int((height_in or width_in * 0.62) * EMU_PER_INCH)
        self.body.append(
            f'''<w:p><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing>
<wp:inline xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" distT="0" distB="0" distL="0" distR="0">
<wp:extent cx="{cx}" cy="{cy}"/><wp:docPr id="{self.next_rid}" name="{esc(path.stem)}"/>
<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:nvPicPr><pic:cNvPr id="0" name="{esc(path.name)}"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="{rid}" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
</pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>'''
        )
        self.add_caption(caption)

    def add_table(self, rows: list[list[str]], widths: list[int]) -> None:
        grid = "".join(f'<w:gridCol w:w="{w}"/>' for w in widths)
        trs = []
        for row_index, row in enumerate(rows):
            cells = []
            for cell, width in zip(row, widths):
                fill = '<w:shd w:fill="E0F2FE"/>' if row_index == 0 else ""
                bold = "<w:b/>" if row_index == 0 else ""
                cells.append(
                    f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/>{fill}</w:tcPr>'
                    f'<w:p><w:r><w:rPr>{bold}</w:rPr><w:t>{esc(cell)}</w:t></w:r></w:p></w:tc>'
                )
            trs.append("<w:tr>" + "".join(cells) + "</w:tr>")
        self.body.append(
            f'<w:tbl><w:tblPr><w:tblW w:w="9000" w:type="dxa"/><w:tblBorders>'
            f'<w:top w:val="single" w:sz="4" w:color="CBD5E1"/><w:left w:val="single" w:sz="4" w:color="CBD5E1"/>'
            f'<w:bottom w:val="single" w:sz="4" w:color="CBD5E1"/><w:right w:val="single" w:sz="4" w:color="CBD5E1"/>'
            f'<w:insideH w:val="single" w:sz="4" w:color="CBD5E1"/><w:insideV w:val="single" w:sz="4" w:color="CBD5E1"/>'
            f'</w:tblBorders><w:tblCellMar><w:left w:w="120" w:type="dxa"/><w:right w:w="120" w:type="dxa"/></w:tblCellMar></w:tblPr>'
            f'<w:tblGrid>{grid}</w:tblGrid>{"".join(trs)}</w:tbl>'
        )

    def add_cover(self) -> None:
        self.add_paragraph("Projet de Fin d'Etudes", "Subtitle")
        self.add_paragraph("LifeLine", "CoverTitle")
        self.add_paragraph("Application Web Medicale d'Urgence", "CoverSubtitle")
        self.add_paragraph("Realise par : Abdelmounaim Ouballa", "CoverMeta")
        self.add_paragraph("Encadre par : ................................................", "CoverMeta")
        self.add_paragraph("Annee universitaire : 2025-2026", "CoverMeta")
        self.add_page_break()

    def write(self, out_path: Path) -> None:
        document_xml = DOCUMENT_XML.format(body="\n".join(self.body))
        rels_xml = RELS_XML.format(rels="\n".join(self.rels))
        with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as docx:
            docx.writestr("[Content_Types].xml", CONTENT_TYPES)
            docx.writestr("_rels/.rels", PACKAGE_RELS)
            docx.writestr("word/document.xml", document_xml)
            docx.writestr("word/_rels/document.xml.rels", rels_xml)
            docx.writestr("word/styles.xml", STYLES_XML)
            docx.writestr("word/numbering.xml", NUMBERING_XML)
            for path in self.media:
                docx.write(path, f"word/media/{path.name}")


def build_docx() -> None:
    figures = make_figures()
    builder = DocxBuilder()
    for filename, caption, chapter in figures:
        builder.figures_by_chapter.setdefault(chapter, []).append((filename, caption))

    builder.add_cover()
    builder.add_paragraph("Liste des figures", "Heading1")
    for _, caption, _ in figures:
        builder.add_paragraph(caption, "Caption")
    builder.add_page_break()

    lines = REPORT_MD.read_text(encoding="utf-8").splitlines()
    skip_initial_title = True
    for raw in lines:
        line = raw.strip()
        if not line or line == "---":
            continue
        if line.startswith("# "):
            if skip_initial_title:
                skip_initial_title = False
                continue
            builder.add_heading(line[2:].strip(), 1)
            continue
        if line.startswith("## "):
            heading = line[3:].strip()
            builder.add_heading(heading, 2)
            matching_figures = []
            for chapter, chapter_figures in builder.figures_by_chapter.items():
                if heading.startswith(chapter):
                    matching_figures.extend(chapter_figures)
            if matching_figures:
                for filename, caption in matching_figures:
                    width = 3.2 if filename.startswith("maquette") else 5.9
                    height = 4.45 if filename.startswith("maquette") else 3.1
                    builder.add_image(FIGURES / filename, caption, width, height)
            continue
        if line.startswith("### "):
            builder.add_heading(line[4:].strip(), 3)
            continue
        if line.startswith("- "):
            builder.add_bullet(line[2:].strip())
            continue
        if re.fullmatch(r"[A-Za-z0-9 .:/`_-]+:", line) and len(line) < 70:
            builder.add_paragraph(line, "Heading3")
            continue
        builder.add_paragraph(line)

    builder.add_page_break()
    builder.add_paragraph("Annexe : Matrice des technologies", "Heading1")
    builder.add_table(
        [
            ["Couche", "Technologie", "Role dans LifeLine"],
            ["Frontend", "React, Vite, React Router", "Interface mobile, navigation et composants reutilisables."],
            ["Backend", "Node.js, Express.js", "API REST, routes, controllers et logique serveur."],
            ["Base de donnees", "Supabase, PostgreSQL", "Stockage des profils, donnees medicales et logs."],
            ["Authentification", "Firebase Auth", "Connexion email/password, Google et verification des tokens."],
            ["QR Code", "qrcode, qr-scanner", "Generation, partage et lecture des QR codes."],
            ["Deploiement", "Vercel", "Hebergement frontend et endpoints serverless."],
        ],
        [1700, 2500, 4800],
    )
    builder.write(OUT_DOCX)


CONTENT_TYPES = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Default Extension="svg" ContentType="image/svg+xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
<Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
<Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
</Types>'''

PACKAGE_RELS = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>'''

RELS_XML = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="styles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
<Relationship Id="numbering" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
{rels}
</Relationships>'''

DOCUMENT_XML = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
<w:body>
{body}
<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>
</w:body>
</w:document>'''

STYLES_XML = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr><w:rPr><w:rFonts w:ascii="Arial" w:hAnsi="Arial"/><w:sz w:val="22"/><w:color w:val="172033"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="120" w:after="260"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="38"/><w:color w:val="0F766E"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="360"/></w:pPr><w:rPr><w:sz w:val="28"/><w:color w:val="475569"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="CoverTitle"><w:name w:val="CoverTitle"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:before="900" w:after="180"/></w:pPr><w:rPr><w:b/><w:sz w:val="64"/><w:color w:val="0F766E"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="CoverSubtitle"><w:name w:val="CoverSubtitle"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="900"/></w:pPr><w:rPr><w:sz w:val="30"/><w:color w:val="334155"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="CoverMeta"><w:name w:val="CoverMeta"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="180"/></w:pPr><w:rPr><w:sz w:val="24"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="Heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="420" w:after="180"/><w:keepNext/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="0F766E"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="Heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="300" w:after="120"/><w:keepNext/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="1D4ED8"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading3"><w:name w:val="Heading 3"/><w:basedOn w:val="Normal"/><w:pPr><w:spacing w:before="180" w:after="80"/><w:keepNext/><w:outlineLvl w:val="2"/></w:pPr><w:rPr><w:b/><w:sz w:val="23"/><w:color w:val="334155"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="ListParagraph"><w:name w:val="List Paragraph"/><w:basedOn w:val="Normal"/><w:pPr><w:ind w:left="720" w:hanging="360"/><w:spacing w:after="80"/></w:pPr></w:style>
<w:style w:type="paragraph" w:styleId="Caption"><w:name w:val="Caption"/><w:basedOn w:val="Normal"/><w:pPr><w:jc w:val="center"/><w:spacing w:after="240"/></w:pPr><w:rPr><w:i/><w:sz w:val="20"/><w:color w:val="475569"/></w:rPr></w:style>
</w:styles>'''

NUMBERING_XML = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:abstractNum w:abstractNumId="0"><w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:ind w:left="720" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr></w:lvl></w:abstractNum>
<w:num w:numId="1"><w:abstractNumId w:val="0"/></w:num>
</w:numbering>'''


if __name__ == "__main__":
    build_docx()
    print(OUT_DOCX)
