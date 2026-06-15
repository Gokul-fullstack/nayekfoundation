"""
NayePankh 3D Volunteer Nexus — PDF Report Generator
Generates a styled volunteer report using ReportLab.
"""

import io
from datetime import datetime, timezone

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
)


# NayePankh brand colour
ORANGE = colors.HexColor('#FF6B35')
DARK_ORANGE = colors.HexColor('#E55A2B')
LIGHT_ORANGE = colors.HexColor('#FFF3ED')
DARK_TEXT = colors.HexColor('#2D2D2D')


def _risk_color(score):
    """Return a colour for the retention score."""
    if score is None:
        return colors.grey
    if score >= 0.7:
        return colors.HexColor('#27AE60')   # green
    if score >= 0.4:
        return colors.HexColor('#F39C12')   # yellow / amber
    return colors.HexColor('#E74C3C')        # red


def _risk_label(score):
    if score is None:
        return 'N/A'
    if score >= 0.7:
        return 'Low'
    if score >= 0.4:
        return 'Medium'
    return 'High'


def generate_report(volunteers_data, stats):
    """
    Build a PDF report and return the buffer (BytesIO).

    Parameters
    ----------
    volunteers_data : list[dict]
        Each dict has keys: name, city, skills, status, retention_score.
    stats : dict
        Keys: total_volunteers, approved_count, pending_count, rejected_count,
              avg_retention_score.

    Returns
    -------
    io.BytesIO   — seeked to position 0, ready to send.
    """
    buf = io.BytesIO()
    doc = SimpleDocTemplate(
        buf, pagesize=A4,
        topMargin=1.2 * cm, bottomMargin=1.5 * cm,
        leftMargin=1.5 * cm, rightMargin=1.5 * cm,
    )

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(
        'CoverTitle', parent=styles['Title'],
        fontSize=28, textColor=colors.white, alignment=1,
        spaceAfter=8,
    ))
    styles.add(ParagraphStyle(
        'CoverSub', parent=styles['Normal'],
        fontSize=14, textColor=colors.white, alignment=1,
        spaceAfter=4,
    ))
    styles.add(ParagraphStyle(
        'SectionHead', parent=styles['Heading2'],
        fontSize=16, textColor=ORANGE, spaceBefore=18, spaceAfter=10,
    ))
    styles.add(ParagraphStyle(
        'Body', parent=styles['Normal'],
        fontSize=11, textColor=DARK_TEXT, leading=16,
    ))
    styles.add(ParagraphStyle(
        'Footer', parent=styles['Normal'],
        fontSize=8, textColor=colors.grey, alignment=1,
    ))

    elements = []

    # ── Cover Page ────────────────────────────────────────────────────
    cover_table = Table(
        [
            [Paragraph('NayePankh Foundation', styles['CoverTitle'])],
            [Paragraph('Volunteer Report', styles['CoverTitle'])],
            [Spacer(1, 12)],
            [Paragraph('"Giving Wings to Every Dream"', styles['CoverSub'])],
            [Paragraph(
                datetime.now(timezone.utc).strftime('Generated on %d %B %Y, %H:%M UTC'),
                styles['CoverSub'],
            )],
        ],
        colWidths=[doc.width],
    )
    cover_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), ORANGE),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 24),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 24),
        ('ROUNDEDCORNERS', [10, 10, 10, 10]),
    ]))
    elements.append(Spacer(1, 2 * inch))
    elements.append(cover_table)
    elements.append(PageBreak())

    # ── Summary Section ───────────────────────────────────────────────
    elements.append(Paragraph('Summary', styles['SectionHead']))
    summary_data = [
        ['Metric', 'Value'],
        ['Total Volunteers', str(stats.get('total_volunteers', 0))],
        ['Approved', str(stats.get('approved_count', 0))],
        ['Pending', str(stats.get('pending_count', 0))],
        ['Rejected', str(stats.get('rejected_count', 0))],
        ['Average Retention Score',
         f"{stats.get('avg_retention_score', 0):.2f}"],
    ]
    summary_table = Table(summary_data, colWidths=[doc.width * 0.55, doc.width * 0.40])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 11),
        ('ALIGN', (1, 0), (1, -1), 'CENTER'),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_ORANGE),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.white),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 0.4 * inch))

    # ── Volunteer Table ───────────────────────────────────────────────
    elements.append(Paragraph('Volunteer Details', styles['SectionHead']))

    table_header = ['#', 'Name', 'City', 'Skills', 'Status', 'Risk']
    table_rows = [table_header]

    for idx, v in enumerate(volunteers_data[:50], start=1):  # cap at 50 rows
        skills_str = ', '.join(v.get('skills', [])[:3]) if isinstance(v.get('skills'), list) else str(v.get('skills', ''))
        if len(skills_str) > 30:
            skills_str = skills_str[:27] + '...'
        retention = v.get('retention_score')
        table_rows.append([
            str(idx),
            str(v.get('name', '')),
            str(v.get('city', '')),
            skills_str,
            str(v.get('status', '')).capitalize(),
            _risk_label(retention),
        ])

    vol_table = Table(
        table_rows,
        colWidths=[
            doc.width * 0.06, doc.width * 0.22, doc.width * 0.16,
            doc.width * 0.28, doc.width * 0.13, doc.width * 0.12,
        ],
        repeatRows=1,
    )

    # Base style
    vol_style = [
        ('BACKGROUND', (0, 0), (-1, 0), ORANGE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (0, -1), 'CENTER'),
        ('ALIGN', (4, 0), (5, -1), 'CENTER'),
        ('GRID', (0, 0), (-1, -1), 0.4, colors.lightgrey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_ORANGE]),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]

    # Colour-code risk column
    for row_idx, v in enumerate(volunteers_data[:50], start=1):
        rc = _risk_color(v.get('retention_score'))
        vol_style.append(('TEXTCOLOR', (5, row_idx), (5, row_idx), rc))
        vol_style.append(('FONTNAME', (5, row_idx), (5, row_idx), 'Helvetica-Bold'))

    vol_table.setStyle(TableStyle(vol_style))
    elements.append(vol_table)
    elements.append(Spacer(1, 0.5 * inch))

    # ── Footer ────────────────────────────────────────────────────────
    elements.append(Paragraph(
        'Generated by NayePankh 3D Volunteer Nexus  •  contact@nayepankh.com',
        styles['Footer'],
    ))

    doc.build(elements)
    buf.seek(0)
    return buf
