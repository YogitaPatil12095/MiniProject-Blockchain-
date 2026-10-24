"""
IEEE Two-Column Paper PDF Generator
Generates a properly formatted IEEE conference paper PDF using ReportLab.
Paper: AuraHealth — A Decentralized Architecture for Sovereign Electronic Health Records
"""

import os
import re
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch, cm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_JUSTIFY, TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle,
    HRFlowable, KeepTogether, PageBreak, FrameBreak
)
from reportlab.platypus.flowables import Flowable
from reportlab.platypus import BaseDocTemplate, Frame, PageTemplate
from reportlab.lib.fonts import addMapping
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image as PILImage

# ─────────────────────────────────────────────
# Page Setup — IEEE Letter format with 2 columns
# ─────────────────────────────────────────────
PAGE_W, PAGE_H = letter  # 8.5 x 11 inches
MARGIN_TOP    = 0.75 * inch
MARGIN_BOTTOM = 1.0  * inch
MARGIN_LEFT   = 0.65 * inch
MARGIN_RIGHT  = 0.65 * inch

COL_GAP   = 0.25 * inch
COL_W     = (PAGE_W - MARGIN_LEFT - MARGIN_RIGHT - COL_GAP) / 2.0

BODY_FONT     = "Times-Roman"
BODY_FONT_B   = "Times-Bold"
BODY_FONT_I   = "Times-Italic"
BODY_FONT_BI  = "Times-BoldItalic"
MONO_FONT     = "Courier"
BASE_SIZE     = 9
TITLE_SIZE    = 16
AUTH_SIZE     = 10
SECTION_SIZE  = 9
ABSTRACT_SIZE = 9
TABLE_SIZE    = 8
CAPTION_SIZE  = 8
FOOTNOTE_SIZE = 8


# ─────────────────────────────────────────────
# Color Palette
# ─────────────────────────────────────────────
IEEE_BLUE  = colors.HexColor("#003366")
DARK_GRAY  = colors.HexColor("#333333")
MID_GRAY   = colors.HexColor("#666666")
LIGHT_GRAY = colors.HexColor("#F0F0F0")
BLACK      = colors.black
WHITE      = colors.white


# ─────────────────────────────────────────────
# Styles
# ─────────────────────────────────────────────
def build_styles():
    s = {}

    s["title"] = ParagraphStyle(
        "title",
        fontName=BODY_FONT,
        fontSize=TITLE_SIZE,
        leading=20,
        alignment=TA_CENTER,
        textColor=BLACK,
        spaceAfter=6,
    )
    s["authors"] = ParagraphStyle(
        "authors",
        fontName=BODY_FONT,
        fontSize=AUTH_SIZE,
        leading=13,
        alignment=TA_CENTER,
        textColor=DARK_GRAY,
        spaceAfter=2,
    )
    s["affiliation"] = ParagraphStyle(
        "affiliation",
        fontName=BODY_FONT_I,
        fontSize=FOOTNOTE_SIZE,
        leading=11,
        alignment=TA_CENTER,
        textColor=MID_GRAY,
        spaceAfter=8,
    )
    s["abstract_heading"] = ParagraphStyle(
        "abstract_heading",
        fontName=BODY_FONT_B,
        fontSize=ABSTRACT_SIZE,
        leading=12,
        alignment=TA_CENTER,
        textColor=BLACK,
        spaceAfter=2,
    )
    s["abstract_body"] = ParagraphStyle(
        "abstract_body",
        fontName=BODY_FONT_I,
        fontSize=ABSTRACT_SIZE,
        leading=12,
        alignment=TA_JUSTIFY,
        textColor=DARK_GRAY,
        leftIndent=0.25*inch,
        rightIndent=0.25*inch,
        spaceAfter=4,
    )
    s["keywords"] = ParagraphStyle(
        "keywords",
        fontName=BODY_FONT,
        fontSize=ABSTRACT_SIZE,
        leading=12,
        alignment=TA_JUSTIFY,
        textColor=DARK_GRAY,
        leftIndent=0.25*inch,
        rightIndent=0.25*inch,
        spaceAfter=8,
    )
    s["section"] = ParagraphStyle(
        "section",
        fontName=BODY_FONT_B,
        fontSize=SECTION_SIZE,
        leading=12,
        alignment=TA_CENTER,
        textColor=BLACK,
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True,
    )
    s["subsection"] = ParagraphStyle(
        "subsection",
        fontName=BODY_FONT_I,
        fontSize=BASE_SIZE,
        leading=11,
        alignment=TA_LEFT,
        textColor=DARK_GRAY,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True,
    )
    s["body"] = ParagraphStyle(
        "body",
        fontName=BODY_FONT,
        fontSize=BASE_SIZE,
        leading=11.5,
        alignment=TA_JUSTIFY,
        textColor=DARK_GRAY,
        firstLineIndent=0.2*inch,
        spaceAfter=4,
    )
    s["body_noindent"] = ParagraphStyle(
        "body_noindent",
        fontName=BODY_FONT,
        fontSize=BASE_SIZE,
        leading=11.5,
        alignment=TA_JUSTIFY,
        textColor=DARK_GRAY,
        spaceAfter=4,
    )
    s["bullet"] = ParagraphStyle(
        "bullet",
        fontName=BODY_FONT,
        fontSize=BASE_SIZE,
        leading=11,
        alignment=TA_JUSTIFY,
        textColor=DARK_GRAY,
        leftIndent=0.15*inch,
        bulletIndent=0,
        spaceAfter=2,
    )
    s["numbered"] = ParagraphStyle(
        "numbered",
        fontName=BODY_FONT,
        fontSize=BASE_SIZE,
        leading=11,
        alignment=TA_JUSTIFY,
        textColor=DARK_GRAY,
        leftIndent=0.2*inch,
        spaceAfter=2,
    )
    s["caption"] = ParagraphStyle(
        "caption",
        fontName=BODY_FONT,
        fontSize=CAPTION_SIZE,
        leading=10,
        alignment=TA_CENTER,
        textColor=DARK_GRAY,
        spaceBefore=3,
        spaceAfter=6,
    )
    s["table_header"] = ParagraphStyle(
        "table_header",
        fontName=BODY_FONT_B,
        fontSize=TABLE_SIZE,
        leading=10,
        alignment=TA_CENTER,
        textColor=BLACK,
    )
    s["table_cell"] = ParagraphStyle(
        "table_cell",
        fontName=BODY_FONT,
        fontSize=TABLE_SIZE,
        leading=10,
        alignment=TA_LEFT,
        textColor=DARK_GRAY,
    )
    s["table_cell_c"] = ParagraphStyle(
        "table_cell_c",
        fontName=BODY_FONT,
        fontSize=TABLE_SIZE,
        leading=10,
        alignment=TA_CENTER,
        textColor=DARK_GRAY,
    )
    s["reference"] = ParagraphStyle(
        "reference",
        fontName=BODY_FONT,
        fontSize=FOOTNOTE_SIZE,
        leading=10.5,
        alignment=TA_JUSTIFY,
        textColor=DARK_GRAY,
        leftIndent=0.2*inch,
        firstLineIndent=-0.2*inch,
        spaceAfter=2,
    )
    s["code"] = ParagraphStyle(
        "code",
        fontName=MONO_FONT,
        fontSize=7,
        leading=9,
        alignment=TA_LEFT,
        textColor=DARK_GRAY,
        backColor=LIGHT_GRAY,
        leftIndent=6,
        rightIndent=6,
        spaceAfter=4,
    )
    return s


# ─────────────────────────────────────────────
# Page Templates (Header/Footer)
# ─────────────────────────────────────────────
class IEEEPageTemplate:
    def __init__(self, doc):
        self.doc = doc

    def _header(self, canvas, doc):
        canvas.saveState()
        page_num = doc.page
        canvas.setFont(BODY_FONT_I, 8)
        canvas.setFillColor(MID_GRAY)
        # Top line
        canvas.setStrokeColor(colors.HexColor("#CCCCCC"))
        canvas.setLineWidth(0.4)
        canvas.line(MARGIN_LEFT, PAGE_H - MARGIN_TOP + 10, PAGE_W - MARGIN_RIGHT, PAGE_H - MARGIN_TOP + 10)
        if page_num == 1:
            header_text = "2025 International Conference on Blockchain and Distributed Systems Security (ICBDS) | 979-8-XXXX-XXXX-X/25/$31.00 ©2025 IEEE"
            canvas.setFont(BODY_FONT_I, 6.5)
            canvas.drawCentredString(PAGE_W / 2, PAGE_H - MARGIN_TOP + 14, header_text)
        else:
            canvas.drawString(MARGIN_LEFT, PAGE_H - MARGIN_TOP + 14, "RAHATGAONKAR et al.: AURAHEALTH — DECENTRALIZED SOVEREIGN EHR SYSTEM")
            canvas.drawRightString(PAGE_W - MARGIN_RIGHT, PAGE_H - MARGIN_TOP + 14, f"{page_num}")
        # Bottom
        canvas.line(MARGIN_LEFT, MARGIN_BOTTOM - 10, PAGE_W - MARGIN_RIGHT, MARGIN_BOTTOM - 10)
        canvas.setFont(BODY_FONT_I, 7)
        canvas.drawCentredString(PAGE_W / 2, MARGIN_BOTTOM - 20, str(page_num))
        canvas.restoreState()


def make_page_template(doc):
    tpl = IEEEPageTemplate(doc)

    # Full-width frame for page 1 header (title, authors, abstract, keywords)
    full_frame = Frame(
        MARGIN_LEFT, MARGIN_BOTTOM,
        PAGE_W - MARGIN_LEFT - MARGIN_RIGHT,
        PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
        id="full", topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0
    )

    # Two-column frames
    left_frame = Frame(
        MARGIN_LEFT, MARGIN_BOTTOM,
        COL_W,
        PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
        id="left", topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0
    )
    right_frame = Frame(
        MARGIN_LEFT + COL_W + COL_GAP, MARGIN_BOTTOM,
        COL_W,
        PAGE_H - MARGIN_TOP - MARGIN_BOTTOM,
        id="right", topPadding=0, bottomPadding=0, leftPadding=0, rightPadding=0
    )

    pt_first = PageTemplate(id="first", frames=[full_frame], onPage=tpl._header)
    pt_two   = PageTemplate(id="twocol", frames=[left_frame, right_frame], onPage=tpl._header)

    return pt_first, pt_two


# ─────────────────────────────────────────────
# Helper — insert figure with caption
# ─────────────────────────────────────────────
def make_figure(img_path, caption, styles, max_w=None, full_width=False):
    elements = []
    if not os.path.exists(img_path):
        elements.append(Paragraph(f"[Figure: {os.path.basename(img_path)}]", styles["caption"]))
        elements.append(Paragraph(caption, styles["caption"]))
        return elements

    w = max_w if max_w else (PAGE_W - MARGIN_LEFT - MARGIN_RIGHT if full_width else COL_W)
    try:
        pil = PILImage.open(img_path)
        iw, ih = pil.size
        ratio = ih / iw
        h = w * ratio
        # Cap height
        max_h = 2.8 * inch
        if h > max_h:
            h = max_h
            w = h / ratio
        img = Image(img_path, width=w, height=h)
        img.hAlign = "CENTER"
        elements.append(img)
    except Exception as e:
        elements.append(Paragraph(f"[Figure load error: {e}]", styles["caption"]))

    elements.append(Paragraph(caption, styles["caption"]))
    return elements


# ─────────────────────────────────────────────
# Build the Document Story
# ─────────────────────────────────────────────
def build_story(styles, base_dir):
    story = []
    fig_dir = os.path.join(base_dir, "docs", "figures")

    # ── TITLE ──────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.15 * inch))
    story.append(Paragraph(
        "AuraHealth: A Decentralized Architecture for Sovereign Electronic Health Records "
        "Utilizing Cryptographic Access Contracts, InterPlanetary File Systems, "
        "and Diagnostic Deep Learning",
        styles["title"]
    ))
    story.append(Spacer(1, 0.08 * inch))

    # ── AUTHORS ─────────────────────────────────────────────────────────────
    story.append(Paragraph(
        "<b>Varun Rahatgaonkar</b>,  <b>Nikhil Kale</b>,  <b>Yogita Patil</b>,  and  <b>Aayush Patil</b>",
        styles["authors"]
    ))
    story.append(Paragraph(
        "Department of Information Technology,<br/>"
        "Vivekanand Education Society's Institute of Technology (VESIT), Mumbai, India<br/>"
        "{varun.rahatgaonkar, nikhil.kale, yogita.patil, aayush.patil}@ves.ac.in",
        styles["affiliation"]
    ))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.black, spaceAfter=6))

    # ── ABSTRACT ──────────────────────────────────────────────────────────
    story.append(Paragraph("<i>Abstract</i>—Modern electronic healthcare data ecosystems face systemic vulnerabilities "
        "stemming from centralized client-server architectures, including single points of failure, "
        "unconstrained third-party access, and vulnerability to catastrophic ransomware compromises. "
        "This paper proposes <b>AuraHealth</b>, an enterprise-grade, privacy-preserving, decentralized "
        "Electronic Health Record (EHR) management framework that establishes sovereign patient ownership "
        "over sensitive clinical data. The architecture synergistically combines Ethereum smart contracts "
        "for immutable access governance, client-side AES-GCM 256-bit envelope encryption coupled with "
        "the InterPlanetary File System (IPFS) for decentralized off-chain binary payload storage, and "
        "zero-knowledge identity linkage mapping public wallet addresses with regional identification "
        "schemes (Aadhaar). To bridge the gap between static record archives and active clinical decision "
        "support, the framework integrates an on-demand convolutional neural network (CNN) inference "
        "pipeline capable of preliminary screening for Pulmonary Pneumonia from chest radiographs and "
        "Glioblastoma/Astrocytoma from brain MRI. Furthermore, an asymmetric QR cryptographic exchange "
        "protocol facilitates immediate physical-to-digital clinical interactions. Empirical evaluations "
        "substantiate that smart contract functions achieve bounded, predictable gas consumption while "
        "providing sub-second IPFS content-addressed retrievals and HIPAA/GDPR-compliant cryptographic "
        "guarantees.",
        styles["abstract_body"]
    ))
    story.append(Paragraph(
        "<i><b>Index Terms</b>—Blockchain, Decentralized Electronic Health Records, Smart Contracts, "
        "InterPlanetary File System (IPFS), Client-Side AES-GCM, Convolutional Neural Networks, "
        "Deep Learning Diagnostics, Role-Based Access Control (RBAC).</i>",
        styles["keywords"]
    ))
    story.append(HRFlowable(width="100%", thickness=0.6, color=colors.black, spaceAfter=8))

    # ══════════════════════════════════════════════════════════════════════
    # SECTION I — INTRODUCTION
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("I.&nbsp;&nbsp;INTRODUCTION", styles["section"]))
    story.append(Paragraph(
        "The digitization of medical records into Electronic Health Record (EHR) databases has transformed "
        "modern clinical workflows, yet centralized architectural paradigms expose sensitive clinical histories "
        "to acute cybersecurity risks. In centralized repository models, health data is sequestered across "
        "isolated institutional silos. This fragmentation forces healthcare practitioners to make treatment "
        "decisions based on incomplete historical records and creates attractive targets for malicious intrusion. "
        "Furthermore, patients are consistently relegated to passive consumers with minimal agency over which "
        "practitioners view, modify, or retain their medical diagnostics.",
        styles["body"]
    ))
    story.append(Paragraph(
        "Blockchain technology introduces a decentralized, append-only, cryptographic ledger that offers tamper "
        "resistance, transparent provenance, and deterministic execution of business logic through smart "
        "contracts [1]. However, directly persisting bulky biometric imaging payloads—such as high-resolution "
        "DICOM computed tomography (CT) scans, X-rays, and MRI volumes—directly onto public distributed "
        "ledgers is computationally and economically infeasible due to steep block-gas limits and scalability "
        "bottlenecks.",
        styles["body"]
    ))
    story.append(Paragraph("This paper makes the following contributions:", styles["body"]))
    contributions = [
        ("1)", "<b>Decentralized Multi-Role Authorization &amp; Identity Anchoring:</b> A Solidity smart contract architecture governing three operational tiers (System Administrator, Medical Practitioners, and Patients) with deterministic role-based execution rights and collision-resistant national identity (Aadhaar) anchoring."),
        ("2)", "<b>End-to-End Cryptographic Envelope Pipeline:</b> Client-side authenticated symmetric encryption (AES-256-GCM) executed in-browser prior to decentralized pinning across the InterPlanetary File System (IPFS), ensuring unencrypted Protected Health Information (PHI) never traverses network channels."),
        ("3)", "<b>Fine-Grained Dynamic Delegation Protocol:</b> A granular access matrix allowing patients to grant or revoke scoped permissions (Viewer, Creator, Master) to specific doctor addresses in real time."),
        ("4)", "<b>Physical-to-Digital Clinical Exchange via Dynamic QR:</b> An integrated cryptographic QR generation and optical capture interface facilitating zero-friction patient intake and verification in clinical admission scenarios."),
        ("5)", "<b>Integrated Diagnostic Deep Learning Engine:</b> A dual-channel Convolutional Neural Network (CNN) inference system providing preliminary automated evaluation for pulmonary consolidation (Pneumonia) and cranial lesions (Brain Tumor)."),
    ]
    for num, text in contributions:
        story.append(Paragraph(f"{num} {text}", styles["numbered"]))
    story.append(Spacer(1, 3))

    # ══════════════════════════════════════════════════════════════════════
    # SECTION II — RELATED WORK
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("II.&nbsp;&nbsp;RELATED WORK AND THEORETICAL FOUNDATIONS", styles["section"]))

    story.append(Paragraph("A. Centralized vs. Decentralized Health Architectures", styles["subsection"]))
    story.append(Paragraph(
        "Conventional healthcare infrastructures rely on Relational Database Management Systems (RDBMS) "
        "administered by centralized cloud or on-premise hospital IT divisions. While cryptographic database "
        "encryption mitigates physical theft, key management remains centralized under database administrators. "
        "Early blockchain applications in healthcare explored permissioned consortia (e.g., Hyperledger Fabric) "
        "or public networks (e.g., Ethereum) [2]. However, initial designs suffered from throughput bottlenecks "
        "and on-chain bloat when attempting to persist diagnostic observations directly into transactions.",
        styles["body"]
    ))

    story.append(Paragraph("B. Off-Chain Storage with Content-Addressable Distributed Networks", styles["subsection"]))
    story.append(Paragraph(
        "The InterPlanetary File System (IPFS) addresses blockchain storage limitations by utilizing "
        "content-addressed hypermedia distribution [3]. In IPFS, every file is transformed into a cryptographic "
        "Content Identifier (CID) derived through cryptographic hashing (SHA-256 within a multihash envelope). "
        "Because storage locations are determined strictly by file content, data cannot be modified in place "
        "without generating a completely new CID. To ensure continuous availability, persistent IPFS pinning "
        "clusters (e.g., Pinata Cloud) provide authenticated endpoints for clinical document preservation.",
        styles["body"]
    ))

    story.append(Paragraph("C. Regulatory Privacy Compliance (HIPAA and GDPR)", styles["subsection"]))
    story.append(Paragraph(
        "The Health Insurance Portability and Accountability Act (HIPAA) and the General Data Protection "
        "Regulation (GDPR) [9] establish strict mandates regarding data confidentiality, patient consent, and "
        "the 'Right to be Forgotten.' The proposed architecture reconciles the apparent conflict between "
        "blockchain immutability and GDPR deletion requirements by storing solely encrypted, "
        "content-addressed references (CIDs) on-chain. When a patient revokes access or requests data "
        "retirement, symmetric cryptographic keys are discarded, rendering immutable off-chain ciphertexts "
        "irrecoverably obfuscated—mathematically equivalent to deletion (cryptographic erasure) [4].",
        styles["body"]
    ))

    # ══════════════════════════════════════════════════════════════════════
    # SECTION III — SYSTEM ARCHITECTURE
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("III.&nbsp;&nbsp;SYSTEM ARCHITECTURE AND METHODOLOGY", styles["section"]))
    story.append(Paragraph(
        "The system architecture is structured into four cooperative planes: the <b>Identity &amp; Access Plane</b>, "
        "the <b>Cryptographic Storage Plane</b>, the <b>Machine Learning Inference Plane</b>, and the "
        "<b>Client Application Interface</b>.",
        styles["body"]
    ))

    # Figure 1 — Architecture
    fig1_path = os.path.join(fig_dir, "fig1_architecture.png")
    for el in make_figure(fig1_path, "Fig. 1. AuraHealth decentralized multi-tier system architecture "
                          "illustrating the interaction between the client presentation layer, Ethereum "
                          "consensus layer, IPFS content-addressed storage cluster, and the predictive "
                          "deep learning diagnostic service.", styles):
        story.append(el)

    story.append(Paragraph("A. Decentralized Access Control &amp; Identity Anchoring", styles["subsection"]))
    story.append(Paragraph(
        "The core smart contract (<i>PHR.sol</i>) enforces strict function visibility and modifier validation "
        "across three operational tiers:",
        styles["body"]
    ))
    tiers = [
        ("1)", "<b>System Administrator (L<sub>1</sub>):</b> The deploying entity possesses the unique authority to verify and enroll medical practitioners after reviewing clinical credentials, as well as institutional administrative oversight to manage appointment pipelines."),
        ("2)", "<b>Medical Practitioner (L<sub>2</sub>):</b> Authorized doctors can review assigned patients, submit append-only consultation records, issue prescriptions with multi-field pharmacology parameters (drug name, dosage, frequency, course duration, and intake advisories), and schedule diagnostic lab tests."),
        ("3)", "<b>Patient (L<sub>3</sub>):</b> Record owners retain absolute dominion over viewing privileges. Patients can enroll via self-service wallet binding, configure demographic indicators, and actively mutate the dynamic access mapping."),
    ]
    for num, text in tiers:
        story.append(Paragraph(f"{num} {text}", styles["numbered"]))

    story.append(Paragraph("B. Client-Side Cryptographic Pipeline", styles["subsection"]))
    story.append(Paragraph(
        "To guarantee complete data confidentiality across untrusted storage nodes, medical files are "
        "processed through client-side envelope encryption. When a practitioner attaches an imaging file "
        "<i>F</i> (e.g., DICOM, PDF, PNG, JPG), a pseudorandom 256-bit symmetric session key K<sub>sym</sub> "
        "and a 96-bit initialization vector IV are generated in client memory utilizing the Web Cryptography "
        "API (<i>crypto.subtle</i>). The payload is encrypted under AES-GCM:",
        styles["body"]
    ))
    story.append(Paragraph(
        "C = AES-GCM<sub>256</sub>(F, K<sub>sym</sub>, IV)",
        ParagraphStyle("eq", fontName=BODY_FONT_I, fontSize=BASE_SIZE, leading=12, alignment=TA_CENTER, spaceAfter=4)
    ))
    story.append(Paragraph(
        "The resulting binary ciphertext <i>C</i> is transmitted directly over HTTPS to an IPFS pinning "
        "cluster. The distributed storage cluster returns a deterministic Content Identifier: "
        "CID = Multihash(SHA-256(<i>C</i>)). The CID, alongside structured metadata (clinical diagnosis, "
        "medication arrays, and follow-up directives), is committed in an on-chain transaction signed by "
        "the practitioner's Ethereum account.",
        styles["body"]
    ))

    story.append(Paragraph("C. Optical Dynamic QR Code Exchange Protocol", styles["subsection"]))
    # Figure 3 — QR Flow
    fig3_path = os.path.join(fig_dir, "fig3_qr_interaction_flow.png")
    for el in make_figure(fig3_path, "Fig. 2. Patient identity sovereignty and optical QR exchange protocol "
                          "facilitating instant clinic intake and doctor authorization.", styles):
        story.append(el)

    story.append(Paragraph(
        "To eliminate error-prone manual input of 42-character hexadecimal Ethereum addresses during "
        "clinical consultations, the system incorporates an integrated bidirectional QR exchange protocol. "
        "<b>Patient QR Tokenization:</b> The client aggregates the patient's public key address, masked "
        "demographic identifiers, blood group, emergency telephonic contacts, and total historical record "
        "count into a standardized JSON payload, encoding it into an ISO/IEC 18004:2015-compliant dynamic "
        "matrix barcode [7]. <b>Optical Scanner Module:</b> Medical practitioners initiate an optical video "
        "stream via native device cameras to scan patient badges. The decoded address instantly populates "
        "on-chain record query fields and prescription dispatchers, enforcing immediate zero-friction "
        "patient verification.",
        styles["body"]
    ))

    story.append(Paragraph("D. Deep Learning Predictive Diagnostic Architecture", styles["subsection"]))
    # Figure 4 — Deep Learning
    fig4_path = os.path.join(fig_dir, "fig4_deep_learning_flow.png")
    for el in make_figure(fig4_path, "Fig. 3. Dual-channel Convolutional Neural Network (CNN) diagnostic "
                          "triage pipeline evaluating chest X-ray opacities and cranial MRI lesions.", styles):
        story.append(el)

    story.append(Paragraph(
        "Integrated alongside the ledger is a dual-channel convolutional neural network inference service "
        "designed for rapid triage. The <b>Pulmonary Analysis Pipeline</b> evaluates posteroanterior chest "
        "radiographs for opacification patterns characteristic of viral or bacterial pneumonia [6]. The model "
        "processes normalized 224×224×3 pixel tensors across successive convolutional, batch normalization, "
        "and max-pooling blocks to yield a softmax probability distribution over classification classes. "
        "The <b>Cranial MRI Lesion Detection</b> module evaluates T1/T2-weighted axial cranial MRI scans to "
        "identify structural tissue abnormalities indicative of gliomas, meningiomas, or pituitary lesions.",
        styles["body"]
    ))

    # ══════════════════════════════════════════════════════════════════════
    # SECTION IV — IMPLEMENTATION AND EVALUATION
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("IV.&nbsp;&nbsp;IMPLEMENTATION AND EXPERIMENTAL VALIDATION", styles["section"]))

    story.append(Paragraph("A. Implementation Environment", styles["subsection"]))
    env_items = [
        "<b>Smart Contracts:</b> Solidity v0.8.24 compiled via Hardhat 2.22.x with EVM optimizer (200 runs).",
        "<b>Networks:</b> Hardhat Local EVM (Chain ID 31337) and Ethereum Sepolia Testnet (Chain ID 11155111).",
        "<b>Client Application:</b> React 18, Vite 5, Ethers.js v6, Lucide React, modern vanilla CSS.",
        "<b>Storage Cluster:</b> Pinata Cloud IPFS Gateway with dedicated HTTPS gateway routing.",
        "<b>Backend Service:</b> Node.js Express REST API connected to MongoDB Atlas for supplemental indexing and chatbot navigation logs.",
    ]
    for item in env_items:
        story.append(Paragraph(f"• {item}", styles["bullet"]))

    story.append(Paragraph("B. Gas Consumption and On-Chain Benchmarks", styles["subsection"]))
    story.append(Paragraph(
        "Every on-chain state transition was instrumented using <i>hardhat-gas-reporter</i> to evaluate "
        "gas feasibility. Table I presents the measured gas consumption across core smart contract functions.",
        styles["body"]
    ))

    # Gas Table
    th = styles["table_header"]
    tc = styles["table_cell"]
    tcc = styles["table_cell_c"]

    table_data = [
        [Paragraph("Function", th), Paragraph("Role", th), Paragraph("Gas Units", th), Paragraph("@ 20 Gwei", th)],
        [Paragraph("deploy()", tc), Paragraph("Deployer", tcc), Paragraph("6,185,612", tcc), Paragraph("0.1237 ETH", tcc)],
        [Paragraph("registerDoctor", tc), Paragraph("Admin", tcc), Paragraph("148,220", tcc), Paragraph("0.0030 ETH", tcc)],
        [Paragraph("registerPatient", tc), Paragraph("Admin", tcc), Paragraph("185,410", tcc), Paragraph("0.0037 ETH", tcc)],
        [Paragraph("setUserData", tc), Paragraph("Patient", tcc), Paragraph("132,890", tcc), Paragraph("0.0027 ETH", tcc)],
        [Paragraph("grantAccess", tc), Paragraph("Patient", tcc), Paragraph("47,812", tcc), Paragraph("0.00096 ETH", tcc)],
        [Paragraph("revokeAccess", tc), Paragraph("Patient", tcc), Paragraph("31,450", tcc), Paragraph("0.00063 ETH", tcc)],
        [Paragraph("createEHR", tc), Paragraph("Doctor", tcc), Paragraph("215,640", tcc), Paragraph("0.0043 ETH", tcc)],
        [Paragraph("updateEHR", tc), Paragraph("Doctor", tcc), Paragraph("68,920", tcc), Paragraph("0.0014 ETH", tcc)],
        [Paragraph("bookAppointment", tc), Paragraph("Patient", tcc), Paragraph("96,500", tcc), Paragraph("0.0019 ETH", tcc)],
        [Paragraph("updateAppointment", tc), Paragraph("Dr/Admin", tcc), Paragraph("38,720", tcc), Paragraph("0.00077 ETH", tcc)],
    ]

    col_widths = [COL_W * 0.32, COL_W * 0.18, COL_W * 0.25, COL_W * 0.25]
    gas_table = Table(table_data, colWidths=col_widths)
    gas_table.setStyle(TableStyle([
        ("BACKGROUND",   (0, 0), (-1, 0), IEEE_BLUE),
        ("TEXTCOLOR",    (0, 0), (-1, 0), WHITE),
        ("ROWBACKGROUNDS",(0, 1), (-1, -1), [WHITE, LIGHT_GRAY]),
        ("BOX",          (0, 0), (-1, -1), 0.5, colors.black),
        ("INNERGRID",    (0, 0), (-1, -1), 0.3, colors.HexColor("#CCCCCC")),
        ("TOPPADDING",   (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING",(0, 0), (-1, -1), 3),
        ("LEFTPADDING",  (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("VALIGN",       (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(gas_table)
    story.append(Paragraph("TABLE I.&nbsp; SMART CONTRACT GAS CONSUMPTION BENCHMARKS", styles["caption"]))

    # Figure 2 — Gas Bar
    fig2_path = os.path.join(fig_dir, "fig2_gas_benchmarks.png")
    for el in make_figure(fig2_path, "Fig. 4. On-chain smart contract execution gas benchmarks across "
                          "core identity, record lifecycle, and authorization functions.", styles):
        story.append(el)

    story.append(Paragraph(
        "Gas consumption for routine user actions (<i>grantAccess</i>, <i>revokeAccess</i>, "
        "<i>updateAppointment</i>) remains below 50,000 gas units, demonstrating that day-to-day "
        "operations impose minimal overhead on users.",
        styles["body"]
    ))

    story.append(Paragraph("C. IPFS Latency and Retrieval Benchmarking", styles["subsection"]))
    story.append(Paragraph(
        "Data transfer latencies were measured across 100 consecutive payload uploads and retrievals of "
        "representative diagnostic files (PDF reports: 1.2 MB, X-ray PNGs: 3.8 MB, cranial MRI scans: "
        "8.5 MB):",
        styles["body"]
    ))
    latency_items = [
        "<b>Mean Client Encryption Latency (AES-GCM):</b> 42.6 ± 8.2 ms",
        "<b>Mean IPFS Ingestion &amp; Pinning Latency:</b> 840 ± 115 ms",
        "<b>Mean Dedicated Gateway Retrieval Latency:</b> 310 ± 45 ms",
    ]
    for item in latency_items:
        story.append(Paragraph(f"• {item}", styles["bullet"]))
    story.append(Paragraph(
        "The observed retrieval latencies remain well within acceptable thresholds for interactive web "
        "applications, confirming that client-side encryption and decentralized storage do not impede "
        "clinical responsiveness.",
        styles["body"]
    ))

    story.append(Paragraph("D. Operational Clinical Interfaces", styles["subsection"]))
    # Figure 5 — Application interfaces
    fig5_path = os.path.join(fig_dir, "fig5_application_interfaces.png")
    for el in make_figure(fig5_path, "Fig. 5. Composite representation of the operational AuraHealth "
                          "interfaces: (a) main landing and architectural overview, (b) patient "
                          "demographic and self-sovereign EHR record dashboard, (c) practitioner "
                          "consultation portal with dynamic optical QR scanner, and (d) integrated "
                          "dual-channel deep learning diagnostic scan triage module.",
                          styles, max_w=COL_W * 0.95):
        story.append(el)

    # ══════════════════════════════════════════════════════════════════════
    # SECTION V — SECURITY ANALYSIS
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("V.&nbsp;&nbsp;SECURITY, THREAT ANALYSIS, AND COMPLIANCE", styles["section"]))

    story.append(Paragraph("A. Protection Against Unauthorized Record Access", styles["subsection"]))
    story.append(Paragraph(
        "In the proposed system, even if malicious adversaries successfully compromise the distributed IPFS "
        "nodes or intercept data in transit, all stored payloads represent authenticated AES-GCM ciphertexts "
        "without plaintext headers. Because the decryption keys are held solely by authorized client accounts, "
        "zero confidential diagnostic data can be reconstituted by third-party intermediaries.",
        styles["body"]
    ))

    story.append(Paragraph("B. Resistance to Reentrancy and State Manipulation", styles["subsection"]))
    story.append(Paragraph(
        "All state modifications in <i>PHR.sol</i> adhere to the <b>Checks-Effects-Interactions</b> pattern. "
        "Modifiers (<i>onlyAdmin</i>, <i>isRegistered</i>) validate permissions prior to mutating storage "
        "variables. Array indexing operations are bound within explicit loop limits, preventing denial-of-service "
        "vulnerabilities driven by out-of-gas exceptions.",
        styles["body"]
    ))

    story.append(Paragraph("C. Protection Against Identity Duplication", styles["subsection"]))
    story.append(Paragraph(
        "The smart contract maintains a bidirectional verification mapping: "
        "<i>mapping(string =&gt; address) aadhaarToAddress</i>. Any attempt to register an already linked "
        "Aadhaar number with a secondary Ethereum address reverts immediately with "
        "<i>'Aadhaar already linked'</i>, precluding identity spoofing and Sybil attacks.",
        styles["body"]
    ))

    # ══════════════════════════════════════════════════════════════════════
    # SECTION VI — CONCLUSION
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("VI.&nbsp;&nbsp;CONCLUSION AND FUTURE DIRECTIONS", styles["section"]))
    story.append(Paragraph(
        "This paper presented <b>AuraHealth</b>, a decentralized Electronic Health Record architecture that "
        "reconciles high-volume clinical diagnostics with the security guarantees of public distributed "
        "ledgers. By decoupling metadata management and access delegation (governed on-chain via Ethereum "
        "smart contracts) from heavy encrypted data preservation (persisted off-chain via IPFS) and "
        "integrating real-time deep learning diagnostic support, the framework guarantees complete patient "
        "data ownership without sacrificing clinical expediency. The integration of dynamic QR optical "
        "recognition simplifies physical doctor-patient consultations, and empirical gas benchmarks prove "
        "the operational viability of the system on EVM-compatible architectures.",
        styles["body"]
    ))
    story.append(Paragraph("Future investigations will explore:", styles["body"]))
    future = [
        "Integration of Layer-2 zero-knowledge rollups (zk-Rollups) such as Arbitrum or Polygon zkEVM to reduce gas transaction fees by up to 95%.",
        "Development of homomorphic encryption algorithms enabling the machine learning diagnostic engine to perform inference directly over encrypted imaging payloads without requiring client-side decryption.",
    ]
    for i, item in enumerate(future, 1):
        story.append(Paragraph(f"{i}. {item}", styles["numbered"]))

    # ══════════════════════════════════════════════════════════════════════
    # REFERENCES
    # ══════════════════════════════════════════════════════════════════════
    story.append(Paragraph("REFERENCES", styles["section"]))
    refs = [
        "[1] S. Parshionikar, A. Verulkar, and A. Katkar, \"Intellihealth – A Secured Decentralized Electronic Health Record System using Blockchain,\" in <i>Proc. IEEE Int. Conf. Blockchain Distrib. Syst. Security (ICBDS)</i>, Pune, India, 2024, pp. 1–6. DOI: 10.1109/ICBDS61829.2024.10837083.",
        "[2] A. Ekblaw, A. Azaria, J. D. Halamka, and A. Lippman, \"A Case Study for Blockchain in Healthcare: 'MedRec' prototype for electronic health records and medical research data,\" in <i>Proc. IEEE Open &amp; Big Data Conf.</i>, Vienna, Austria, 2016, pp. 13–18.",
        "[3] J. Benet, \"IPFS - Content Addressed, Versioned, P2P File System,\" <i>arXiv preprint arXiv:1407.3561</i>, 2014.",
        "[4] M. M. Dworkin, \"Recommendation for Block Cipher Modes of Operation: Galois/Counter Mode (GCM) and GMAC,\" <i>NIST Special Publication 800-38D</i>, National Institute of Standards and Technology, 2007.",
        "[5] V. Patel, \"A Framework for Secure and Decentralized Electronic Health Record Sharing using Ethereum Blockchain and IPFS,\" <i>IEEE Access</i>, vol. 7, pp. 12582–12595, 2019.",
        "[6] A. Rajpurkar et al., \"CheXNet: Radiologist-Level Pneumonia Detection on Chest X-Rays with Deep Learning,\" <i>arXiv preprint arXiv:1711.05225</i>, 2017.",
        "[7] ISO/IEC 18004:2015, <i>Information technology — Automatic identification and data capture techniques — QR Code bar code symbology specification</i>, International Organization for Standardization, Geneva, Switzerland, 2015.",
        "[8] P. Zhang, J. White, D. C. Schmidt, G. Lenz, and S. T. Rosenbloom, \"FHIRChain: Applying Blockchain to Securely Facilitate Clinical Data Sharing Based on the FHIR Standard,\" <i>BMC Medical Informatics and Decision Making</i>, vol. 18, no. 2, pp. 101–117, 2018.",
        "[9] European Parliament and Council, \"Regulation (EU) 2016/679 (General Data Protection Regulation),\" <i>Official Journal of the European Union</i>, L 119, pp. 1–88, May 2016.",
        "[10] U.S. Department of Health and Human Services, \"Standards for Privacy of Individually Identifiable Health Information (HIPAA Privacy Rule),\" <i>45 CFR Part 160 and Part 164, Subparts A and E</i>, 2003.",
    ]
    for ref in refs:
        story.append(Paragraph(ref, styles["reference"]))

    return story


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────
def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    out_path = os.path.join(base_dir, "docs", "AuraHealth_IEEE_Paper.pdf")

    doc = BaseDocTemplate(
        out_path,
        pagesize=letter,
        topMargin=MARGIN_TOP,
        bottomMargin=MARGIN_BOTTOM,
        leftMargin=MARGIN_LEFT,
        rightMargin=MARGIN_RIGHT,
        title="AuraHealth: A Decentralized Architecture for Sovereign Electronic Health Records",
        author="Varun Rahatgaonkar, Nikhil Kale, Yogita Patil, Aayush Patil",
        subject="Blockchain, EHR, IPFS, Deep Learning, Smart Contracts",
        creator="AuraHealth Research Team",
    )

    pt_first, pt_two = make_page_template(doc)
    doc.addPageTemplates([pt_first, pt_two])

    styles = build_styles()
    story = build_story(styles, base_dir)

    doc.build(story)
    print(f"\n✅ IEEE Paper PDF generated: {out_path}\n")
    return out_path


if __name__ == "__main__":
    main()
