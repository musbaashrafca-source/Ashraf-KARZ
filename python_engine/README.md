# UAE Preowned Car Aggregator & Market Intelligence Engine

A modular Python aggregation and market analytics pipeline designed for the United Arab Emirates used-car ecosystem. Ingests listings from the top 5 preowned car dealerships in the UAE:
1. **Al-Futtaim Automall**
2. **CARS24 UAE**
3. **Kavak UAE**
4. **CarSwitch**
5. **The Elite Cars**

---

## 1. Quickstart (CLI)

```bash
# Display aggregate market overview
python3 python_engine/cli.py --action summary

# List inventory filtered by make or dealer
python3 python_engine/cli.py --action list --make Toyota
python3 python_engine/cli.py --action list --dealer "The Elite Cars"

# Compare 2 to 5 vehicles side-by-side
python3 python_engine/cli.py --action compare --ids AFA-LC300-01 C24-LC300-02 CSW-LC300-03

# Run data transparency and completeness audit
python3 python_engine/cli.py --action audit

# Trigger feed synchronization
python3 python_engine/cli.py --action sync

# Export consolidated data as JSON
python3 python_engine/cli.py --action export --format json > inventory_export.json
```

---

## 2. Connecting Real Dealer Feeds

The system provides dedicated connector interfaces in `python_engine/connectors.py`:

| Dealer | Preferred Ingestion Protocol | Authentication & Endpoint |
|---|---|---|
| **Al-Futtaim Automall** | Authorized Enterprise SFTP / REST Feed | `https://api.automalluae.com/v2/inventory` (Bearer Token) |
| **CARS24 UAE** | Digital Inventory Webhook / Catalog Feed | `https://feed.cars24.com/ae/vehicles` (API Key Header) |
| **Kavak UAE** | Partner Catalog REST API | `https://api.kavak.com/ae/catalog/v1` (OAuth2 Client Credentials) |
| **CarSwitch** | Certified Marketplace XML / JSON Feed | `https://inventory.carswitch.com/export/certified.json` (Basic Auth) |
| **The Elite Cars** | Bespoke Luxury Inventory XML/CSV Feed | SFTP server sync or CSV daily upload |

### Batch Excel / CSV Imports
Dealers can also provide periodic CSV or XLSX inventory sheets. Upload directly through the Admin UI or call:
```python
from python_engine.aggregator import AggregatorEngine

engine = AggregatorEngine()
with open("dealer_feed.csv", "r") as f:
    result = engine.import_csv_feed(dealer_id="alfuttaim", csv_content=f.read())
print(result)
```

---

## 3. Data Governance & GCC Compliance

- **GCC vs Imported (Non-GCC) Disclosures**: The UAE climate demands heavy-duty radiators, Gulf-tuned air conditioning, and regional filter calibrations. Non-GCC specifications (USA, Japan, Europe) are distinctly flagged.
- **No Inferred Clean History**: Missing accident reports or warranty fields are explicitly tagged as `Undisclosed` rather than assumed clean.
- **Buyer Suitability Score**: Configurable multi-variable scoring model that accounts for price position against market median, annual mileage wear, model year, warranty duration, and agency service records.
