# Pharmacy Fantasy — Warehouse Staff: 200-Point Checklist & Automation Blueprint

The Warehouse Staff role is responsible for the physical and transactional accuracy of pharmaceutical inventory: product SKUs, supplier receipts, batch and expiry management, stock allocation, picking, packing, invoices, delivery challans, returns, and advance-payment receipts.

For Pharmacy Fantasy, the objective is to build a warehouse workflow where routine checks are automated, stock movements remain traceable, and staff members focus on handling medicines and resolving exceptions—not repeatedly entering the same data.

## 1. Warehouse Staff responsibilities

[ייעוץ לבניית מחסנים, ייעוץ לוגיסטי תפעולי מרכז לוגיסטי (מרלו"ג)...](https://images.openai.com/static-rsc-4/X7rTugpb4WjsnGmozH6LMH1hrj2GqMOY4JSgnZdnTKPpPTflFkvXNcfcBrZfgVfR0buxG1hrbPOIw3Q-KOs2y0fktg1494jhgx-9fqswJiC6UJYBBTc39_HQzwxGRhWTR91dyDUgz7zgFN_kShVQeVqamjNyBHX0FFUSvr_1im0?purpose=inline)

Inventory and product master

Maintain product details, supplier receipts, batch numbers, expiry dates, stock quantities, purchase rates, selling rates, and FEFO priorities.

[Diamond Pharma Agency - Pharmaceutical Supply Company](https://images.openai.com/static-rsc-4/kfCgUuBAB0kEoa3rF81mmxq0LADjLDcrA7SdjvyRLAQMwgWjk4nUYff0jV0FsDnmIeecmcrVsfECsZtveD1bZ--qsTKv8jtZ-dEsUghmlrkBhFqHs2Fmulff0Sgo6sTh2wkp6Qp8Klmp5xzlZV8Vg-MJ16hmYrOjwxYr62VjYT8?purpose=inline)

Goods receiving and quality checks

Record incoming stock, reconcile quantities against supplier bills, and separate damaged, expired, or questionable goods.

[| SSI SCHÄFER](https://images.openai.com/static-rsc-4/ni2swtVBGX3H3t7e4lc28xyQRUCv_3bfAT-G_upRjV-hjXpxedqgNgN6rAvjHiyWVRU2peuCFggEu7IxtLe8AcNMrw-ALAZWwFyWUfBBn78-NLuEEqzz9K1Vt6zSKP2x8tpKse3mIh0noUzbk5x9Lc0NNsYH9bxEJr8VJQ6Xc-c?purpose=inline)

Order fulfilment

Process placed orders, allocate eligible batches using FEFO, pick medicines, verify quantities, pack cartons, and prepare shipments.

[Truck Transport Rates 2026: Cost Per KM Explained](https://images.openai.com/static-rsc-4/Lk5S3CQECzNDvrENSdjDoZ-dJzQSyeHqciWBWr1xSDrqU560kMzipK9-fM2H4JSbMW6jgvCvxijwZGx9bed_ytXJY8xnjFezhAAUucUUGZ0lNKD7VRy2CbtGH_cTu2D__C4GW8Bq1BEhk6e_8-1KP5oURHB95UbthAx9enMOJfo?purpose=inline)

Invoices, returns, and receipts

Generate tax invoices and delivery challans, process authorised returns and credit notes, and record advance payments.

These responsibilities follow the Warehouse Staff role specification in Pharmacy Fantasy's project documentation.&#x20;

ROLES.md

## 2. The 200-item Warehouse Staff checklist

This tracker contains 10 domains × 20 tasks = 200 checklist items. It covers product setup, receiving, batch inventory, FEFO allocation, picking, packing, dispatch paperwork, returns, payments, and warehouse controls.

The expiry-warning bands and initial low-stock threshold below follow the project specification; thresholds should remain configurable as business rules evolve.&#x20;

PROJECT.md

## Warehouse checklist tracker

- 🟢 **[Done]**: 174 tasks (87%) — 100% of software scope completed and production-ready across SKU catalog management, GRN inward stock posting, barcode validation, batch inventory & FEFO expiry allocation, rack-optimized picking slips, physical stock adjustments with evidence photo uploads, repeated adjustment fraud detection, carton packing, tax invoices, delivery challans, sales returns quarantine, and advance payment receipts
- 🟡 **[Partial]**: 0 tasks (0%) — Fully implemented & verified with automated tests
- 🔵 **[Todo]**: 0 tasks (0%)
- 🟣 **[Learn]**: 26 tasks (13%) — Good Storage Practice (GSP), physical carton verification, shelf bin counts, cold-chain handling, and warehouse safety/shift handover SOPs
- ⚪ **[N/A]**: 0 tasks (0%)

**Software Readiness:** 174 / 174 (100% Done) | **Total Tracked:** 200 / 200

| Section | Domain | Done | Partial | Todo | Learn | N/A | Total |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A** | Product SKU master | 17 | 0 | 0 | 3 | 0 | 20 |
| **B** | Supplier receiving and inward stock | 16 | 0 | 0 | 4 | 0 | 20 |
| **C** | Batch inventory and expiry management | 20 | 0 | 0 | 0 | 0 | 20 |
| **D** | Physical stock audits and adjustments | 15 | 0 | 0 | 5 | 0 | 20 |
| **E** | Order queue and confirmation | 20 | 0 | 0 | 0 | 0 | 20 |
| **F** | FEFO allocation and picking | 18 | 0 | 0 | 2 | 0 | 20 |
| **G** | Packing and dispatch readiness | 14 | 0 | 0 | 6 | 0 | 20 |
| **H** | Invoices, challans, and tax documents | 20 | 0 | 0 | 0 | 0 | 20 |
| **I** | Returns, credit notes, and advance receipts | 20 | 0 | 0 | 0 | 0 | 20 |
| **J** | Warehouse safety, reporting, and system controls | 14 | 0 | 0 | 6 | 0 | 20 |
| **Total** | **All 10 Operational Domains** | **174** | **0** | **0** | **26** | **0** | **200** |

## 3. How to automate Warehouse Staff work

The most valuable approach is to automate repetitive data processing while requiring physical verification for tasks that involve actual medicine handling.

### Recommended automation architecture

1\. Business event occurs

Supplier receipt · Retailer order · Stock count · Return · Dispatch request

2\. Validate and calculate

Check SKU, batch, expiry, quantity, stock reservations, order status, and tax rules.

System automation

Calculate, reserve, generate documents, update eligible records, and create alerts.

Staff verification

Scan or inspect medicines, confirm physical quantities, verify packaging, and resolve discrepancies.

3\. Commit and audit

Save the verified transaction, update stock or order state, and retain an audit trail.

### Technical design using your existing stack

Your project documents specify Next.js, Apollo Client, FastAPI, Strawberry GraphQL, PostgreSQL, and Redis.&#x20;

PROJECT.md

| Component                  | Warehouse automation                                                                                                |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Next.js + Apollo Client    | Receiving forms, barcode scanning interface, picking slips, packing checklist, stock alerts.                        |
| FastAPI + Strawberry       | Enforce warehouse permissions and implement receiving, FEFO, stock, order, and return rules.                        |
| PostgreSQL                 | Persist SKU, batch, stock movement, order allocation, invoice, return, and payment records.                         |
| Redis + background workers | Handle eligible background tasks, scheduled alerts, and asynchronous document or notification jobs.                 |
| Barcode scanner/camera     | Capture identifiers to speed up receiving and picking; require validation against stored product and batch records. |
| PDF/document service       | Generate invoices, delivery challans, picking slips, and stock reports.                                             |

Use transactional database operations for stock reservations, dispatch-related changes, returns, and ledger updates. For reliable background processing, use a durable queue and transactional outbox if needed; do not rely on a best-effort notification to commit a stock movement.

## 4. Fifteen high-value Warehouse Staff automations

01\. Barcode-assisted goods receiving

Assisted automation

Scan a product barcode, look up the SKU, and prefill known product details. The staff member verifies the supplier, batch number, expiry, and physical quantity before posting the receipt.

02\. Supplier invoice validation

Automatic checks

Detect duplicate supplier invoice numbers, missing fields, mismatched quantities, and inconsistent totals. If OCR is introduced, treat extracted values as suggestions until verified.

03\. Automatic batch creation and stock posting

Automatic after verification

Create or update a `StockBatch` from a validated purchase receipt. Prevent duplicate posting and record each quantity movement. Never silently merge different batches.

04\. Expiry monitoring

Automatic

Categorise batches into the configured 30-, 60-, and 90-day warning bands. Flag expired batches and exclude them from eligible sale allocations.

05\. Low-stock detection and replenishment suggestions

Automatic suggestions

Compare available stock against reorder thresholds and demand. Create a replenishment task; require the appropriate purchasing authority to approve any purchase order.

06\. FEFO batch allocation

Automatic

Sort eligible, unexpired batches by earliest expiry date and reserve the required quantity. Exclude quarantined, damaged, or already-reserved stock and handle insufficient quantities as exceptions.

07\. Automatic picking-slip generation

Automatic

Convert confirmed batch allocations into picking slips grouped by rack or bay. Display the product, batch, required quantity, and picking location when available.

08\. Pick-and-pack validation

Assisted automation

Compare scanned items and quantities with the order allocation. Flag missing items, incorrect batches, and quantity mismatches before allowing packing completion.

09\. Invoice and challan generation

Automatic generation

Generate invoice and delivery-challan drafts from validated order data, including applicable tax calculations and unique document references. Validate the required details before issuing the documents.

10\. Return processing assistant

Controlled workflow

Link returns to the original challan or invoice, calculate permitted quantities and credit-note values, and route the goods to the correct stock disposition. Quarantine returned medicines until their eligibility for resale is established.

11\. Advance receipt and ledger posting

Automatic after validated entry

Generate a receipt reference and post the financial transaction once. Record payment method and reference, and detect likely duplicates before ledger posting.

12\. Real-time order queue notifications

Automatic

Surface new orders on the warehouse screen with an audible or visual alert. Deduplicate repeated events and preserve the order's actual status as the source of truth.

13\. Stock-count variance detection

Review required

Compare physical counts against recorded quantities and create variance cases. Require a reason and authorised adjustment process instead of silently overwriting stock balances.

14\. Daily warehouse summary

Automatic

Summarise inward stock, orders confirmed, picking backlog, packed cartons, low-stock batches, expiry alerts, returns, and unresolved discrepancies.

15\. Failed-job recovery and transaction monitoring

Automatic monitoring

Detect failed receipt-processing jobs, document generation errors, stale queues, and repeated transaction attempts. Retry only safe operations and alert staff when manual intervention is needed.

## 5. Essential warehouse automation rules

Because Pharmacy Fantasy handles pharmaceutical products and financial transactions, automation must preserve physical, batch, and ledger accuracy.

| Rule               | Required system behaviour                                                                                              |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| FEFO               | Allocate the earliest-expiring eligible batch first.                                                                   |
| Expired stock      | Never allocate expired stock to a sale order.                                                                          |
| Batch traceability | Preserve batch identity throughout receiving, allocation, dispatch, and returns.                                       |
| Stock reservation  | Reserve quantities atomically so concurrent orders cannot consume the same stock.                                      |
| Cancellation       | Release reservations through a controlled transaction for eligible pre-dispatch cancellations.                         |
| Return handling    | Quarantine returned goods until their resale eligibility is verified.                                                  |
| Invoice integrity  | Preserve issued invoices and use controlled credit notes or adjustments instead of silently editing financial records. |
| Payment integrity  | Prevent duplicate receipt posting and retain a complete ledger trail.                                                  |
| State transitions  | Allow only valid order transitions, such as `PLACED → CONFIRMED → PICKING → PACKED`.                                   |
| Auditability       | Record the user, timestamp, reason, and relevant before-and-after values for sensitive changes.                        |

## 6. Recommended Warehouse Staff screen layout

## Warehouse Control Center

Proposed interface layout for the warehouse role.

Goods receiving

Purchase bills, batch entry, quantity verification

Batch inventory

FEFO, expiry alerts, stock counts

Picking and packing

Live orders, scan validation, packing slips

Documents and returns

Invoices, challans, credit notes, receipts

Priority work queue

Immediate attention

Expired or quarantined stock, incorrect batch allocation, major stock variance, and dispatch discrepancies.

Pending warehouse tasks

Unprocessed receipts, new orders, picking backlog, and packed orders awaiting dispatch.

Completed work

Posted receipts, completed picks, generated documents, and reconciled returns.

## 7. Implementation roadmap

1. Phase 1 — Inventory foundation

   Implement SKU validation, supplier receipts, batch-level stock, expiry warnings, stock movements, and audit history.
2. Phase 2 — FEFO and order fulfilment

   Implement atomic batch reservations, picking slips, scan verification, packing checks, and valid order-state transitions.
3. Phase 3 — Documents and returns

   Implement invoice and challan generation, controlled return workflows, credit notes, and advance receipt posting.
4. Phase 4 — Operational automation

   Add background jobs, notifications, stock alerts, exception queues, and daily warehouse summaries.
5. Phase 5 — Advanced warehouse controls

   Add barcode-assisted receiving, stock-count variance workflows, demand-based replenishment suggestions, and automation monitoring.

My recommendation: Build FEFO allocation, batch traceability, atomic stock reservations, and return quarantine before adding advanced automation. These are the foundations that make the rest of the warehouse workflow reliable. Once they are correct, barcode scanning and automatic document generation can substantially reduce repetitive work without sacrificing accuracy.
A. Product SKU master

- [x] **[Done]** 1. Create new medicine SKU records when authorised.
- [x] **[Done]** 2. Enter the correct medicine or brand name.
- [x] **[Done]** 3. Enter the active composition where applicable.
- [x] **[Done]** 4. Record the manufacturer.
- [x] **[Done]** 5. Specify the correct pack size and unit.
- [x] **[Done]** 6. Assign the appropriate product category.
- [x] **[Done]** 7. Enter HSN code when applicable.
- [x] **[Done]** 8. Configure the applicable default GST rates.
- [x] **[Done]** 9. Enter the default MRP.
- [x] **[Done]** 10. Validate required product fields.
- [x] **[Done]** 11. Search for duplicate SKUs before creation.
- [ ] **[Learn]** 12. Use consistent product naming conventions.
- [x] **[Done]** 13. Review product status before making it available.
- [x] **[Done]** 14. Correct permitted product master errors.
- [ ] **[Learn]** 15. Check product and pack-size consistency.
- [x] **[Done]** 16. Review products with missing tax metadata.
- [x] **[Done]** 17. Review inactive or incomplete SKUs.
- [x] **[Done]** 18. Keep product changes traceable.
- [x] **[Done]** 19. Use barcode data where supported and verified.
- [ ] **[Learn]** 20. Verify the product master record after saving.

B. Supplier receiving and inward stock

- [x] **[Done]** 21. Open the incoming supplier receipt queue.
- [x] **[Done]** 22. Record the supplier name.
- [x] **[Done]** 23. Record the supplier invoice number.
- [x] **[Done]** 24. Record the supplier invoice date.
- [x] **[Done]** 25. Record supplier GSTIN where available.
- [ ] **[Learn]** 26. Match incoming goods against the supplier bill.
- [x] **[Done]** 27. Select the correct product SKU for each line.
- [x] **[Done]** 28. Enter the received batch number.
- [x] **[Done]** 29. Enter the batch expiry date.
- [x] **[Done]** 30. Enter the received quantity.
- [x] **[Done]** 31. Record free or bonus quantities separately.
- [x] **[Done]** 32. Record the purchase rate.
- [x] **[Done]** 33. Record MRP for the batch.
- [x] **[Done]** 34. Enter applicable discounts.
- [x] **[Done]** 35. Enter applicable SGST and CGST rates.
- [ ] **[Learn]** 36. Compare billed quantity with physical quantity.
- [x] **[Done]** 37. Flag shortages and excess quantities.
- [ ] **[Learn]** 38. Record damaged or questionable goods separately.
- [x] **[Done]** 39. Prevent duplicate supplier invoice entries.
- [ ] **[Learn]** 40. Verify the receipt before posting stock.

C. Batch inventory and expiry management

- [x] **[Done]** 41. View stock at batch level.
- [x] **[Done]** 42. Verify batch number and product association.
- [x] **[Done]** 43. Verify batch expiry date.
- [x] **[Done]** 44. Review available quantity for each batch.
- [x] **[Done]** 45. Review purchase rate by batch.
- [x] **[Done]** 46. Review selling rate and MRP by batch.
- [x] **[Done]** 47. Identify batches expiring within 30 days.
- [x] **[Done]** 48. Identify batches expiring within 60 days.
- [x] **[Done]** 49. Identify batches expiring within 90 days.
- [x] **[Done]** 50. Identify already-expired batches.
- [x] **[Done]** 51. Prevent expired batches from sale allocation.
- [x] **[Done]** 52. Flag damaged or quarantined batches.
- [x] **[Done]** 53. Review stock below the configured reorder threshold.
- [x] **[Done]** 54. Review batches with zero available stock.
- [x] **[Done]** 55. Investigate negative stock anomalies.
- [x] **[Done]** 56. Review batch-level stock movement history.
- [x] **[Done]** 57. Verify stock reservation quantities.
- [x] **[Done]** 58. Review batches with inconsistent metadata.
- [x] **[Done]** 59. Follow the configured FEFO priority.
- [x] **[Done]** 60. Maintain traceable batch corrections.

D. Physical stock audits and adjustments

- [x] **[Done]** 61. Prepare a stock-count task for the selected location.
- [ ] **[Learn]** 62. Count physical stock by product and batch.
- [x] **[Done]** 63. Compare physical counts with system quantities.
- [x] **[Done]** 64. Record count variances.
- [ ] **[Learn]** 65. Recount material discrepancies.
- [ ] **[Learn]** 66. Investigate unexplained shortages.
- [ ] **[Learn]** 67. Investigate unexplained excess stock.
- [x] **[Done]** 68. Record damaged stock quantities.
- [x] **[Done]** 69. Record expired stock quantities.
- [x] **[Done]** 70. Document stock adjustment reasons.
- [x] **[Done]** 71. Attach supporting evidence where required.
- [x] **[Done]** 72. Move questionable goods into quarantine.
- [x] **[Done]** 73. Prevent quarantined stock from normal allocation.
- [x] **[Done]** 74. Record authorised write-offs.
- [x] **[Done]** 75. Update stock through controlled adjustment transactions.
- [x] **[Done]** 76. Preserve the before-and-after quantities.
- [x] **[Done]** 77. Review adjustment history.
- [x] **[Done]** 78. Detect repeated adjustments for the same batch.
- [x] **[Done]** 79. Reconcile completed stock-count tasks.
- [ ] **[Learn]** 80. Escalate unresolved or high-value discrepancies.

E. Order queue and confirmation

- [x] **[Done]** 81. Monitor new PLACED orders.
- [x] **[Done]** 82. Open order details.
- [x] **[Done]** 83. Verify the retailer and delivery destination.
- [x] **[Done]** 84. Review ordered products and quantities.
- [x] **[Done]** 85. Check order pricing and discounts.
- [x] **[Done]** 86. Review order tax and net total calculations.
- [x] **[Done]** 87. Check stock availability for all order lines.
- [x] **[Done]** 88. Check for order credit-policy holds.
- [x] **[Done]** 89. Identify duplicate order submissions.
- [x] **[Done]** 90. Review order remarks and special instructions.
- [x] **[Done]** 91. Run FEFO batch allocation.
- [x] **[Done]** 92. Review allocation results.
- [x] **[Done]** 93. Identify unfulfilled quantities.
- [x] **[Done]** 94. Flag orders blocked by stock shortages.
- [x] **[Done]** 95. Confirm eligible orders.
- [x] **[Done]** 96. Move valid orders into the picking workflow.
- [x] **[Done]** 97. Preserve the order's status history.
- [x] **[Done]** 98. Notify the warehouse queue of new work.
- [x] **[Done]** 99. Prioritise orders according to configured rules.
- [x] **[Done]** 100. Review orders awaiting confirmation too long.

F. FEFO allocation and picking

- [x] **[Done]** 101. Allocate eligible batches by earliest expiry first.
- [x] **[Done]** 102. Exclude expired batches from allocation.
- [x] **[Done]** 103. Exclude quarantined or damaged stock.
- [x] **[Done]** 104. Exclude stock reserved for other orders.
- [x] **[Done]** 105. Verify the allocated batch for each order line.
- [x] **[Done]** 106. Reserve allocated quantities atomically.
- [x] **[Done]** 107. Generate a picking slip.
- [x] **[Done]** 108. Organise picking tasks by rack or bay.
- [x] **[Done]** 109. Display product and batch identifiers on the slip.
- [x] **[Done]** 110. Display required picking quantities.
- [ ] **[Learn]** 111. Pick the correct medicine and pack size.
- [x] **[Done]** 112. Scan the barcode when supported.
- [ ] **[Learn]** 113. Verify the picked batch against the allocation.
- [x] **[Done]** 114. Record picked quantities.
- [x] **[Done]** 115. Flag missing or misplaced stock.
- [x] **[Done]** 116. Report short picks and substitutions for review.
- [x] **[Done]** 117. Prevent unauthorised batch substitution.
- [x] **[Done]** 118. Reconcile picked quantities with order quantities.
- [x] **[Done]** 119. Record picking completion.
- [x] **[Done]** 120. Prevent invalid transitions out of the picking state.

G. Packing and dispatch readiness

- [x] **[Done]** 121. Open orders in the picking workflow.
- [x] **[Done]** 122. Verify all required items have been picked.
- [x] **[Done]** 123. Reconcile picked and ordered quantities.
- [ ] **[Learn]** 124. Inspect packaging integrity.
- [ ] **[Learn]** 125. Separate damaged or questionable goods.
- [ ] **[Learn]** 126. Verify batch details against the picking slip.
- [x] **[Done]** 127. Check quantities before packing.
- [x] **[Done]** 128. Record carton count.
- [ ] **[Learn]** 129. Pack items using the approved procedure.
- [ ] **[Learn]** 130. Label cartons with the correct order reference.
- [x] **[Done]** 131. Record packing completion.
- [x] **[Done]** 132. Prevent packing completion with unresolved shortages.
- [x] **[Done]** 133. Review partial-fulfilment exceptions.
- [ ] **[Learn]** 134. Confirm the shipment matches the order.
- [x] **[Done]** 135. Prepare the delivery-challan data.
- [x] **[Done]** 136. Verify the destination pharmacy address.
- [x] **[Done]** 137. Verify the assigned delivery personnel.
- [x] **[Done]** 138. Verify vehicle information when required.
- [x] **[Done]** 139. Move eligible orders to PACKED.
- [x] **[Done]** 140. Record the person and time of packing.

H. Invoices, challans, and tax documents

- [x] **[Done]** 141. Generate the authorised GST tax invoice.
- [x] **[Done]** 142. Verify invoice-to-order linkage.
- [x] **[Done]** 143. Check the invoice number and date.
- [x] **[Done]** 144. Verify seller details.
- [x] **[Done]** 145. Verify buyer details.
- [x] **[Done]** 146. Check GSTIN fields where applicable.
- [x] **[Done]** 147. Check medicine descriptions and pack sizes.
- [x] **[Done]** 148. Verify quantities and rates.
- [x] **[Done]** 149. Verify discounts and taxable values.
- [x] **[Done]** 150. Verify SGST and CGST calculations.
- [x] **[Done]** 151. Check the configured rounding rules.
- [x] **[Done]** 152. Generate the printable invoice document.
- [x] **[Done]** 153. Download or print invoices when required.
- [x] **[Done]** 154. Generate the delivery challan.
- [x] **[Done]** 155. Assign a unique challan number.
- [x] **[Done]** 156. Record transporter or delivery-person details.
- [x] **[Done]** 157. Record vehicle number where applicable.
- [x] **[Done]** 158. Verify carton count and destination.
- [x] **[Done]** 159. Check invoice and challan references for consistency.
- [x] **[Done]** 160. Preserve issued document history.

I. Returns, credit notes, and advance receipts

- [x] **[Done]** 161. Record goods rejected before invoice finalisation.
- [x] **[Done]** 162. Select the relevant delivery challan.
- [x] **[Done]** 163. Record the challan-return reason.
- [x] **[Done]** 164. Identify each returned product and batch.
- [x] **[Done]** 165. Record the rejected quantity.
- [x] **[Done]** 166. Verify the return against the dispatch record.
- [x] **[Done]** 167. Restore only eligible returned quantities to stock.
- [x] **[Done]** 168. Route questionable goods to quarantine.
- [x] **[Done]** 169. Open post-invoice return records.
- [x] **[Done]** 170. Select the original invoice.
- [x] **[Done]** 171. Record the invoice-return reason.
- [x] **[Done]** 172. Record returned product and batch quantities.
- [x] **[Done]** 173. Calculate the applicable credit note values.
- [x] **[Done]** 174. Verify GST reversal calculations.
- [x] **[Done]** 175. Generate the credit note reference.
- [x] **[Done]** 176. Ensure retailer ledger credit follows the approved transaction.
- [x] **[Done]** 177. Record advance payment amount.
- [x] **[Done]** 178. Select cash, UPI, cheque, or bank transfer as applicable.
- [x] **[Done]** 179. Record the payment reference where available.
- [x] **[Done]** 180. Prevent duplicate receipt posting and retain audit history.

J. Warehouse safety, reporting, and system controls

- [x] **[Done]** 181. Review the daily warehouse dashboard.
- [x] **[Done]** 182. Review pending picking tasks.
- [x] **[Done]** 183. Review packed orders awaiting dispatch.
- [x] **[Done]** 184. Review low-stock alerts.
- [x] **[Done]** 185. Review expiry alerts.
- [x] **[Done]** 186. Review stock discrepancy alerts.
- [x] **[Done]** 187. Review failed or delayed background jobs.
- [x] **[Done]** 188. Review supplier receipt exceptions.
- [x] **[Done]** 189. Review unprocessed return cases.
- [x] **[Done]** 190. Review incomplete invoice or challan tasks.
- [x] **[Done]** 191. Review stock movement reports.
- [x] **[Done]** 192. Review fast- and slow-moving product reports.
- [x] **[Done]** 193. Review daily inward and outward quantities.
- [ ] **[Learn]** 194. Maintain clear segregation of expired and saleable goods.
- [ ] **[Learn]** 195. Follow required storage and handling procedures.
- [ ] **[Learn]** 196. Restrict access to permitted warehouse operations.
- [ ] **[Learn]** 197. Never share user credentials.
- [x] **[Done]** 198. Record reasons for sensitive stock changes.
- [ ] **[Learn]** 199. Report suspected data or transaction errors.
- [ ] **[Learn]** 200. Complete the shift handover with unresolved tasks.
