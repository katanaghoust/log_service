from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet
from io import BytesIO
from datetime import datetime

def generate_log_pdf(log_entries):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    styles = getSampleStyleSheet()
    elements = []

    elements.append(Paragraph("Логи за выбранный период", styles["Title"]))
    elements.append(Spacer(1, 12))

    data = [["Время", "Версия", "BW", "F start", "F end", "F detected"]]

    for entry in log_entries:
        data.append([
            datetime.strptime(entry["timestamp"], "%Y-%m-%dT%H:%M:%S").strftime("%d.%m.%Y %H:%M"),
            entry["version"],
            f"{entry['bandwidth']:.1f}",
            f"{entry['freq_start']:.2f}",
            f"{entry['freq_end']:.2f}",
            f"{entry['detected_freq']:.2f}"
        ])

    table = Table(data, repeatRows=1, colWidths=[80, 80, 40, 60, 60, 60])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.whitesmoke),
        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("GRID", (0, 0), (-1, -1), 0.25, colors.black),
    ]))

    elements.append(table)
    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
