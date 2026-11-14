"""PDF report generation with reportlab."""
import datetime
from pathlib import Path
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

TITLES = {"RISK_ASSESSMENT": "GLOF Risk Assessment", "LAKE_CHANGE": "Lake Change Report",
          "FLOOD_SIMULATION": "Flood Scenario Report", "MONTHLY": "Monitoring Summary"}

def _table(rows, widths=None):
    t = Table(rows, colWidths=widths, repeatRows=1)
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0f3a4a")),
                           ("TEXTCOLOR", (0, 0), (-1, 0), colors.white), ("FONTSIZE", (0, 0), (-1, -1), 8),
                           ("GRID", (0, 0), (-1, -1), .3, colors.grey),
                           ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f2f6f8")])]))
    return t

def make_pdf(path: Path, rtype: str, lakes: list[dict], risks: dict, history: dict, sim: dict | None, region: str):
    ss = getSampleStyleSheet(); doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    el = [Paragraph(f"HIMNETRA - {TITLES.get(rtype, rtype)}", ss["Title"]),
          Paragraph(f"{region} | generated {datetime.datetime.now():%d %b %Y %H:%M}", ss["Normal"]), Spacer(1, 12)]
    rows = [["Lake", "District", "Area km2", "Change %", "Risk", "Score"]] + \
           [[l["name"][:28], l["district"], f'{l["currentArea"]:.3f}', f'{l["areaChangePct"]:+.1f}', l["riskLevel"], l["riskScore"]] for l in lakes]
    el += [Paragraph("Lake summary", ss["Heading2"]), _table(rows), Spacer(1, 12)]
    if len(lakes) == 1:
        l = lakes[0]; r = risks.get(l["id"])
        if r:
            el += [Paragraph("Risk factors (weighted contributions)", ss["Heading2"]),
                   _table([["Factor", "Points", "Meaning"]] + [[f["name"], f["contribution"], f["description"][:70]] for f in r["factors"]],
                          [3.3*cm, 1.8*cm, 11.5*cm]), Spacer(1, 6), Paragraph(r["explanation"], ss["Normal"]), Spacer(1, 12)]
        h = history.get(l["id"], [])
        if h:
            el += [Paragraph("Lake area by year (km2, Sentinel-1/2 deep-learning segmentation)", ss["Heading2"]),
                   _table([["Year", "Area km2"]] + [[p["date"][:4], f'{p["area"]:.3f}'] for p in h], [3*cm, 3*cm]), Spacer(1, 12)]
        if sim:
            f = lambda v, u="": "pending flood model" if v is None else f"{v}{u}"
            el += [Paragraph(f"Scenario: {sim['scenario']}", ss["Heading2"]),
                   _table([["Quantity", "Value"], ["Lake volume (empirical)", f"{sim['waterVolume']} M m3"],
                           ["Released volume", f"{sim['estimatedRelease']} M m3"], ["Peak discharge (empirical)", f"{sim['peakDischarge']} m3/s"],
                           ["Flood extent", f(sim['floodExtent'], ' km2')], ["Time to impact", f(sim['timeToImpact'], ' min')],
                           ["Settlements affected", f(sim['affectedSettlements'])], ["Roads affected", f(sim['affectedRoads'], ' km')]],
                          [6*cm, 8*cm]), Spacer(1, 12)]
    el.append(Paragraph("Method: lake outlines from a U-Net trained on optical-index weak labels and applied to RGB + Sentinel-1 + DEM; "
                        "risk score is a relative weighted ranking across the monitored lakes. Scenario volumes use empirical relations "
                        "(Huggel 2002, Evans 1986) and are indicative only; this is not a validated hydrodynamic forecast.", ss["Italic"]))
    doc.build(el)
