# Pharmacy Fantasy — Retail Shopkeeper: 200-Point Checklist & Automation Blueprint

The Retail Shopkeeper (`SHOPKEEPER`) is the customer-facing role in Pharmacy Fantasy. The shopkeeper uses the platform to browse wholesale medicines, compare trade prices and schemes, place orders within an approved credit limit, track deliveries, access invoices, and monitor the shop's financial ledger.

The project specification explicitly supports self-service retailer registration, a wholesale product catalogue, live trade pricing, credit-limit checks, real-time order processing, order tracking, invoice history, and PDF invoice downloads.&#x20;

ROLES.md

pages.md

The objective is to make routine purchasing and account management as automatic as possible, while keeping medicine selection, order confirmation, payment verification, and financial records accurate.

## 1. The 200-item Retail Shopkeeper checklist

This tracker contains 10 domains × 20 tasks = 200 checklist items. It can be used for feature development, user acceptance testing, onboarding, and operational readiness.

## Retail Shopkeeper checklist tracker

**Status Breakdown across 200 items:**

- 🟢 **[Done]**: 160 tasks (80.0%) — Production-ready in registration, SMS OTP phone verification, password recovery workflow, ordering, 1-Click reorder, live status tracking, 4-digit OTP handshake, ETA window, delivery ratings, discrepancy disputes, tax invoices, unallocated advance receipts, party ledger, notification channel toggles, and return claims
- 🟡 **[Partial]**: 0 tasks (0%) — 100% of software tasks completed
- 🔵 **[Todo]**: 0 tasks (0%) — All planned software features implemented
- 🟣 **[Learn]**: 40 tasks (20.0%) — Pharmacy counter procedures, statutory drug license compliance, Schedule H1 registers, and cold storage
- ⚪ **[N/A]**: 0 tasks (0%)

**Software Readiness:** 160 / 160 (100% software scope readiness: 160/160 software tasks Done) | **Total Tracked:** 200 / 200

| Section | Domain | Done | Partial | Todo | Learn | N/A | Total |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A** | Registration, profile, and account access | 19 | 0 | 0 | 1 | 0 | 20 |
| **B** | Product catalogue and medicine discovery | 17 | 0 | 0 | 3 | 0 | 20 |
| **C** | Cart management and wholesale order creation | 20 | 0 | 0 | 0 | 0 | 20 |
| **D** | Credit limits, pricing, and order validation | 17 | 0 | 0 | 3 | 0 | 20 |
| **E** | Order history, tracking, and changes | 18 | 0 | 0 | 2 | 0 | 20 |
| **F** | Delivery, receipt, and proof of delivery | 12 | 0 | 0 | 8 | 0 | 20 |
| **G** | Invoices, returns, and credit notes | 19 | 0 | 0 | 1 | 0 | 20 |
| **H** | Payments, advances, and account ledger | 17 | 0 | 0 | 3 | 0 | 20 |
| **I** | Notifications, support, and account maintenance | 16 | 0 | 0 | 4 | 0 | 20 |
| **J** | Security, compliance, and purchasing controls | 5 | 0 | 0 | 15 | 0 | 20 |
| **Total** | **All 10 Operational Domains** | **160** | **0** | **0** | **40** | **0** | **200** |

## 2. How to automate the Retail Shopkeeper's work

The biggest opportunity is to make Pharmacy Fantasy a self-service wholesale purchasing assistant: the shopkeeper selects medicines and quantities, and the platform handles price calculation, credit validation, order submission, tracking, documentation, and account updates.

### Recommended end-to-end automation

1\. Discover medicines

Search by brand, composition, category, pack size, stock availability, and eligible trade schemes.

2\. Build and validate cart

Calculate line totals, discounts, taxes, and order net total using authoritative backend pricing rules.

3\. Check credit and stock

Validate credit headroom and stock eligibility before accepting the order.

4\. Submit and track

Create the order, notify the warehouse, and show status updates in the shopkeeper's account.

5\. Close the commercial loop

Expose delivery proof, invoices, receipts, return status, credit notes, and the updated ledger.

The project's existing credit policy is:

\\[ \text{Outstanding Balance}+\text{Order Net Total} \leq \text{Credit Limit} \\]

This must be enforced by the backend during order submission—not merely displayed in the frontend.&#x20;

PROJECT.md

## 3. Fifteen high-value automations

01\. Intelligent medicine search

Automatic

Search by brand, composition, and category. Add spelling tolerance and synonyms where safe, while showing the exact product, composition, manufacturer, and pack size so similar medicines are not confused.

02\. Live trade pricing and scheme calculation

Automatic

Fetch current authorised trade rates and applicable schemes. Recalculate discounts and tax on the backend at checkout, and show the itemised breakdown before submission.

03\. Smart cart and saved orders

Automatic

Save cart changes, calculate totals as quantities change, restore an unfinished cart, and allow the shopkeeper to reorder from previous purchases. Revalidate all lines when submitting.

04\. Real-time credit guard

Automatic

Calculate available credit and reject orders that exceed the approved limit. Handle simultaneous order submissions atomically so two concurrent orders cannot both consume the same credit headroom.

05\. Stock availability validation

Automatic

Show an in-stock indicator and validate eligible stock before order acceptance. When stock is insufficient, explain the shortage and offer a back-in-stock alert or permitted alternative for the retailer to choose.

06\. One-tap order submission

Automatic

Validate the cart, pricing, credit, and required fields; create the order with an idempotency key; return the order number and confirmation. Repeated taps must not create duplicate orders.

07\. Instant order confirmation

Automatic

Show the accepted order in the retailer's order history and notify the warehouse queue. Send the retailer a confirmation only after the transaction has successfully committed.

08\. Live order tracking

Automatic

Present the order timeline from PLACED through confirmation, picking, packing, dispatch, and delivery. Update the timeline from validated server events rather than relying on frontend guesses.

09\. Automatic invoice availability

Automatic

Link issued invoices to the appropriate order, notify the retailer when available, and provide secure PDF preview and download. Preserve the original issued invoice and its version history.

10\. Live account ledger

Automatic

Display invoice debits, validated payments, approved credit notes, advances, and outstanding balance from the authoritative ledger. Avoid maintaining a separate editable balance in the retailer interface.

11\. Payment and credit reminders

Automatic

Send configurable reminders for overdue invoices and approaching credit limits. Link each reminder to the relevant invoice or ledger entry and suppress reminders when the underlying balance changes.

12\. Quick reorder from purchase history

Assisted automation

Prepopulate a cart from a prior order or frequent-purchase list. Recheck current product availability, pack size, pricing, schemes, and credit before submission. Never silently submit the reorder.

13\. Return and credit-note tracking

Controlled workflow

Show the return reference, reason, processing status, and any issued credit note. Calculate eligible credits through the authorised return workflow, not through a retailer-editable balance adjustment.

14\. Self-service support and issue reporting

Assisted automation

Let the retailer report incorrect quantities, delivery discrepancies, missing invoices, or ledger issues. Prefill the relevant order or invoice reference and route the case to the correct operations queue.

15\. Personal purchasing dashboard

Automatic

Summarise active orders, recent purchases, outstanding credit, recent invoices, payment status, and open support or return cases. Keep financial figures linked to authoritative backend records.

## 4. Technical architecture using your existing stack

The project documentation specifies Next.js, Apollo Client, FastAPI, Strawberry GraphQL, and PostgreSQL. The following architecture applies those components to the shopkeeper's automation workflow.&#x20;

PROJECT.md

| Component                                  | Responsibility                                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Next.js                                    | Shopkeeper dashboard, catalogue, cart, checkout, order history, invoices, ledger.                   |
| Apollo Client                              | GraphQL queries and mutations, cache updates, and order-status refreshes.                           |
| FastAPI + Strawberry GraphQL               | Server-side validation, credit checks, order submission, permissions, and financial workflows.      |
| PostgreSQL                                 | Products, orders, order lines, retailer credit, invoices, payment records, and ledger transactions. |
| Redis + background workers                 | Notifications, scheduled reminders, and asynchronous processing.                                    |
| Durable event queue/outbox                 | Reliable order notifications and background processing after database transactions commit.          |
| PDF/document service                       | Secure invoice preview, generation, and download.                                                   |
| Payment gateway integration, if introduced | Trusted payment confirmation and reconciliation for online payments.                                |

### Recommended database entities

ShopkeeperProfile

Shop name, owner, address, phone, GSTIN, licence details, account status.

Product / ProductPrice

SKU, composition, pack size, manufacturer, trade price, MRP, scheme rules.

Order / OrderItem

Retailer, order number, quantities, price snapshot, discounts, taxes, status.

CreditAccount / LedgerEntry

Approved limit, invoice debits, payments, advances, credit notes, outstanding balance.

Invoice / PaymentReceipt

Issued invoice references, PDF metadata, payment method, transaction reference, settlement status.

ReturnRequest / Notification

Return lifecycle, credit-note reference, alerts, delivery or billing issue follow-ups.

These are recommended logical entities, not a claim that every table already exists in the current database schema.

## 5. Essential safeguards

- Credit integrity: Recheck the current outstanding balance and proposed order total in a database transaction.
- Pricing integrity: Recalculate prices, discounts, and taxes on the server; never trust totals supplied by the browser.
- Stock integrity: Reserve stock through controlled transactions so concurrent orders cannot oversell available inventory.
- Order ownership: A shopkeeper can access only their own orders, invoices, payment records, and ledger.
- Cancellation: Enforce the project's pre-confirmation cancellation permission and reject requests after the permitted state.
- Payment integrity: Record payments once, use trusted payment confirmation where available, and reconcile unapplied payments.
- Invoice integrity: Do not silently alter issued invoices; process corrections through the appropriate authorised document workflow.
- Return integrity: Keep returned goods and credit-note processing under the authorised warehouse/admin workflow.
- Notification reliability: Use idempotent events and retry failed notification jobs without duplicating orders or financial entries.
- Privacy and auditability: Protect retailer records, restrict access, and log sensitive account and financial changes.

## 6. Implementation roadmap

1. Phase 1 — Catalogue and profile

   Complete retailer registration, profile validation, product search, category filters, trade pricing, and product detail pages.
2. Phase 2 — Cart and credit-safe checkout

   Implement cart calculations, backend price validation, stock checks, atomic credit-limit enforcement, idempotent order submission, and warehouse notifications.
3. Phase 3 — Orders and delivery tracking

   Implement order history, permitted cancellation, status timelines, dispatch information, delivery confirmation, and discrepancy reporting.
4. Phase 4 — Invoices and ledger

   Complete secure invoice downloads, payment and advance visibility, ledger reconciliation, return tracking, and credit-note visibility.
5. Phase 5 — Customer automation

   Add smart reordering, configurable reminders, notification preferences, self-service support, and the personal purchasing dashboard.

## 7. How to measure automation success

Track these metrics from the beginning:

- Order submission success rate and duplicate-order rate.
- Percentage of orders blocked correctly by credit or stock validation.
- Checkout completion time.
- Invoice availability after the relevant billing event.
- Order-status freshness and notification delivery success.
- Payment-to-ledger reconciliation rate.
- Return resolution time.
- Retailer support requests per 100 orders.
- Repeat-order usage and reorder completion rate.

My recommendation: Build the shopkeeper experience around five core screens first: Catalogue → Cart & Checkout → My Orders → Invoices → Ledger. Automate validation and data movement behind those screens. That gives retailers a complete purchasing workflow without making them navigate the internal warehouse, delivery, or financial administration systems.
A. Registration, profile, and account access

- [x] **[Done]** 1. Register using a valid mobile number on `/register`.
- [x] **[Done]** 2. Verify mobile number (SMS OTP verification flow with instant verification).
- [x] **[Done]** 3. Enter the pharmacy or shop name.
- [x] **[Done]** 4. Enter the shop owner's / pharmacist's full name.
- [x] **[Done]** 5. Enter the shop's full physical street address.
- [x] **[Done]** 6. Select the shop's operational area and city (e.g. Benachity, Durgapur).
- [x] **[Done]** 7. Enter the primary contact phone number.
- [x] **[Done]** 8. Enter GSTIN when registered.
- [x] **[Done]** 9. Enter the statutory drug licence details.
- [x] **[Done]** 10. Provide Form 20B wholesale licence details.
- [x] **[Done]** 11. Provide Form 21B retail licence details.
- [x] **[Done]** 12. Review all submitted registration details before saving.
- [x] **[Done]** 13. Accept wholesale trading terms and compliance notices.
- [x] **[Done]** 14. Access the dedicated `ShopkeeperDashboard` immediately after registration.
- [x] **[Done]** 15. Complete any outstanding profile requirements in settings.
- [x] **[Done]** 16. Update permitted contact details in account profile.
- [x] **[Done]** 17. Update the delivery destination address when the pharmacy relocates.
- [x] **[Done]** 18. Review account verification status (`VERIFIED` vs `PENDING_VERIFICATION`).
- [x] **[Done]** 19. Recover access through the password reset workflow (multi-step SMS/Email OTP recovery with password strength meter).
- [ ] **[Learn]** 20. Contact distributor operations when account access is blocked or locked.

B. Product catalogue and medicine discovery

- [x] **[Done]** 21. Open the wholesale product catalogue on `/dashboard/products`.
- [x] **[Done]** 22. Search by commercial brand or medicine name.
- [x] **[Done]** 23. Search by active chemical composition or therapeutic salt.
- [x] **[Done]** 24. Browse medicines by pharmaceutical category.
- [x] **[Done]** 25. Filter the catalogue by category pills.
- [x] **[Done]** 26. Open a product's detailed inspection view.
- [x] **[Done]** 27. Review the manufacturer information (e.g. Alembic, Intas, Alkem, Glenmark).
- [x] **[Done]** 28. Check active composition and therapeutic strength.
- [x] **[Done]** 29. Verify the pack size configuration (e.g. 10S, 15S, 60ML).
- [x] **[Done]** 30. Check the unit of ordering (strips/bottles).
- [x] **[Done]** 31. Review the displayed wholesale trade rate (PTR).
- [x] **[Done]** 32. Review the displayed Maximum Retail Price (MRP).
- [x] **[Done]** 33. Review available wholesale trade schemes.
- [x] **[Done]** 34. Review eligible trade discount percentages.
- [x] **[Done]** 35. Check the live in-stock availability indicator.
- [x] **[Done]** 36. Identify medicines currently out of stock.
- [x] **[Done]** 37. Compare available alternatives and pack sizes.
- [ ] **[Learn]** 38. Check for duplicate or conflicting catalogue entries.
- [ ] **[Learn]** 39. Report incorrect product pricing or metadata to distributor.
- [ ] **[Learn]** 40. Recheck product composition and strengths before placing orders.

C. Cart management and wholesale order creation

- [x] **[Done]** 41. Start a new wholesale order from `/dashboard/orders`.
- [x] **[Done]** 42. Search for the required medicine from the catalog.
- [x] **[Done]** 43. Add a medicine line item to the order.
- [x] **[Done]** 44. Select the required pack size.
- [x] **[Done]** 45. Enter the desired order quantity.
- [x] **[Done]** 46. Add multiple medicine lines to a single consolidated order.
- [x] **[Done]** 47. Edit line item quantities dynamically.
- [x] **[Done]** 48. Remove unwanted items from the order draft.
- [x] **[Done]** 49. Review each product name, quantity, and unit rate.
- [x] **[Done]** 50. Check pack-size constraints and order multiples.
- [x] **[Done]** 51. Review applicable trade discount deductions.
- [x] **[Done]** 52. Review wholesale trade scheme deductions.
- [x] **[Done]** 53. Review free or bonus quantities applied to order lines.
- [x] **[Done]** 54. Check each line's calculated subtotal.
- [x] **[Done]** 55. Review taxable order value.
- [x] **[Done]** 56. Review calculated SGST (2.5%) amount.
- [x] **[Done]** 57. Review calculated CGST (2.5%) amount.
- [x] **[Done]** 58. Review the final payable net invoice total.
- [x] **[Done]** 59. Check the destination pharmacy address and counter delivery notes.
- [x] **[Done]** 60. Submit the wholesale order for warehouse confirmation.

D. Credit limits, pricing, and order validation

- [x] **[Done]** 61. View the approved credit limit on the dashboard.
- [x] **[Done]** 62. View the current outstanding uncollected debt balance.
- [x] **[Done]** 63. View the remaining available credit headroom.
- [x] **[Done]** 64. Review the total value of the proposed order.
- [x] **[Done]** 65. Calculate projected balance ($Outstanding + Order \le Limit$).
- [x] **[Done]** 66. Enforce order submission rules within the approved credit line.
- [x] **[Done]** 67. Understand when an order is blocked by credit ceiling exhaustion.
- [x] **[Done]** 68. Review clear rejection messages when credit is exceeded.
- [ ] **[Learn]** 69. Contact the Operations Admin to request a credit line adjustment.
- [x] **[Done]** 70. Review overdue invoice payment alerts on the dashboard.
- [x] **[Done]** 71. Ensure line rates reflect authoritative server-side prices.
- [x] **[Done]** 72. Ensure applicable trade discounts match active distributor schemes.
- [x] **[Done]** 73. Ensure GST calculation matches statutory rates.
- [x] **[Done]** 74. Check net totals and tax splits before confirmation.
- [x] **[Done]** 75. Ensure currency rounding adheres to commercial standards.
- [ ] **[Learn]** 76. Report unexpected rate changes or billing discrepancies.
- [ ] **[Learn]** 77. Report balance differences to the finance operations desk.
- [x] **[Done]** 78. Prevent duplicate order submissions using button disabling and unique tokens.
- [x] **[Done]** 79. Receive unique order reference number immediately upon submission.
- [x] **[Done]** 80. Retain order reference for delivery receipt and tracking.

E. Order history, tracking, and changes

- [x] **[Done]** 81. View the shop's complete order history on `/dashboard/orders`.
- [x] **[Done]** 82. Open any order by its reference number in the detail drawer.
- [x] **[Done]** 83. View the current order status badge.
- [x] **[Done]** 84. Track `PENDING` orders awaiting admin confirmation.
- [x] **[Done]** 85. Track `CONFIRMED` orders verified against stock.
- [x] **[Done]** 86. Track `PICKING` progress on the visual order timeline.
- [x] **[Done]** 87. Track `PACKED` orders ready at the dispatch bay.
- [x] **[Done]** 88. Track `DISPATCHED` orders assigned to courier transit.
- [x] **[Done]** 89. Track `DELIVERED` orders with completed proof of delivery.
- [x] **[Done]** 90. Review the visual `OrderFlowTimeline` showing past and current steps.
- [x] **[Done]** 91. Review ordered items, allocated batch numbers, and expiry dates.
- [x] **[Done]** 92. Review final billed amounts and applied trade discounts.
- [x] **[Done]** 93. View assigned delivery courier name and vehicle number.
- [x] **[Done]** 94. Review estimated delivery arrival window.
- [x] **[Done]** 95. Cancel order while status is still `PENDING`.
- [x] **[Done]** 96. Prevent cancellation once order has entered `PACKED` or `DISPATCHED`.
- [x] **[Done]** 97. Review immediate status change when an order is cancelled.
- [ ] **[Learn]** 98. Report an order experiencing picking or dispatch delays.
- [ ] **[Learn]** 99. Report missing items or delivery packaging issues.
- [x] **[Done]** 100. Use 1-Click Re-order to duplicate previous orders instantly.

F. Delivery, receipt, and proof of delivery

- [x] **[Done]** 101. Review courier assignment information for outgoing orders.
- [x] **[Done]** 102. Confirm the delivery destination address on file.
- [ ] **[Learn]** 103. Keep the registered shop mobile phone reachable for the courier.
- [ ] **[Learn]** 104. Prepare shop counter space for receiving medicine cartons.
- [x] **[Done]** 105. View the Delivery Challan reference and carton count.
- [ ] **[Learn]** 106. Match arriving cartons against the accompanying challan.
- [ ] **[Learn]** 107. Count physical cartons received from the courier.
- [ ] **[Learn]** 108. Inspect outer corrugated shipper cartons for crushing, tears, or wetness.
- [ ] **[Learn]** 109. Identify missing or extra cartons before the courier departs.
- [x] **[Done]** 110. Compare delivered medicines with the digital invoice in the portal.
- [ ] **[Learn]** 111. Verify medicine names, strengths, and pack sizes at the counter.
- [x] **[Done]** 112. Record package shortages or damages via the return claims module.
- [ ] **[Learn]** 113. Inform the delivery courier immediately about any visible damage.
- [x] **[Done]** 114. Provide the 4-digit Delivery Handshake OTP displayed on the order screen.
- [x] **[Done]** 115. Sign the courier's digital ePOD screen to confirm receipt.
- [x] **[Done]** 116. Access digital copies of Delivery Challan and Tax Invoice anytime.
- [x] **[Done]** 117. Verify the order status transitions to `DELIVERED` in real time.
- [x] **[Done]** 118. Report a delivery mistakenly marked complete.
- [x] **[Done]** 119. Maintain digital archival copies of all delivered orders.
- [x] **[Done]** 120. Submit formal return claims for rejected or defective goods.

G. Invoices, returns, and credit notes

- [x] **[Done]** 121. Open the pharmacy invoice history on `/dashboard/invoices`.
- [x] **[Done]** 122. Search and filter invoices by invoice number or payment status.
- [x] **[Done]** 123. Open detailed invoice breakdowns in the preview drawer.
- [x] **[Done]** 124. Review invoice date, sequential invoice number, and place of supply.
- [x] **[Done]** 125. Verify distributor GSTIN and pharmacy buyer details.
- [x] **[Done]** 126. Review medicine line items with batch numbers and HSN codes.
- [x] **[Done]** 127. Review billed quantities, wholesale trade rates, and MRPs.
- [x] **[Done]** 128. Review applied trade discounts and taxable values.
- [x] **[Done]** 129. Review itemized SGST and CGST tax calculations.
- [x] **[Done]** 130. Review the final invoice grand total.
- [x] **[Done]** 131. Download or view printable GST Tax Invoices.
- [x] **[Done]** 132. Print tax invoices for statutory pharmacy records.
- [x] **[Done]** 133. Cross-reference invoices with accompanying delivery challans.
- [ ] **[Learn]** 134. Report invoice calculation discrepancies to distributor accounts.
- [x] **[Done]** 135. Identify medicines qualifying for return (damage, expiry, wrong item).
- [x] **[Done]** 136. Submit return claims with mandatory reason and defect remarks.
- [x] **[Done]** 137. Link return requests to original orders and invoices.
- [x] **[Done]** 138. Specify exact medicine, batch number, and unit quantity in claims.
- [x] **[Done]** 139. Track return claim status (`PENDING`, `APPROVED`, `REJECTED`).
- [x] **[Done]** 140. Verify approved credit notes are automatically credited to the party ledger.

H. Payments, advances, and account ledger

- [x] **[Done]** 141. Open the "Party Ledger & Statement" tab on `/dashboard/invoices`.
- [x] **[Done]** 142. View real-time running outstanding balances.
- [x] **[Done]** 143. Track invoice debits added to the running ledger.
- [x] **[Done]** 144. Track payment credits applied to the running ledger.
- [x] **[Done]** 145. Track approved return credit notes in the ledger transaction feed.
- [x] **[Done]** 146. View unallocated advance receipts (overview metrics, filter controls, and surplus credit status badges).
- [x] **[Done]** 147. Record advance payments towards future wholesale orders.
- [x] **[Done]** 148. View payment receipts and collection acknowledgements.
- [x] **[Done]** 149. Verify payment receipt numbers, dates, and amounts.
- [x] **[Done]** 150. Track collection mode (Cash, UPI, Bank Transfer).
- [x] **[Done]** 151. Record UPI transaction reference numbers on payments.
- [ ] **[Learn]** 152. Retain physical cash receipts and bank transfer confirmations.
- [ ] **[Learn]** 153. Report uncredited payments to distributor finance with UTR proof.
- [x] **[Done]** 154. Verify chronological ordering of ledger transactions.
- [x] **[Done]** 155. View overdue payment balances highlighted in red.
- [x] **[Done]** 156. Review wholesale 15-day / 30-day payment term deadlines.
- [x] **[Done]** 157. Settle balances before due dates to maintain credit headroom.
- [ ] **[Learn]** 158. Request ledger reconciliation statements for year-end audit.
- [x] **[Done]** 159. Filter ledger statements across custom date ranges.
- [x] **[Done]** 160. Print or export party ledger statements to CSV/PDF.

I. Notifications, support, and account maintenance

- [x] **[Done]** 161. Receive instant confirmation on order submission.
- [x] **[Done]** 162. Receive status updates as orders move from confirmed to packed.
- [x] **[Done]** 163. Receive dispatch alerts with assigned courier contact details.
- [x] **[Done]** 164. Receive delivery completion confirmations.
- [x] **[Done]** 165. Receive credit limit warning alerts when utilization exceeds 80%.
- [x] **[Done]** 166. Receive overdue invoice reminders on the dashboard.
- [x] **[Done]** 167. Access generated tax invoices immediately upon order packing.
- [x] **[Done]** 168. Receive status updates on raised return claims.
- [x] **[Done]** 169. Review unread operational alerts in a central notification center.
- [x] **[Done]** 170. Click on order alerts to navigate directly to the relevant order.
- [x] **[Done]** 171. Configure notification preferences (in-app, SMS, WhatsApp).
- [ ] **[Learn]** 172. Report medicine catalogue errors to the distributor helpdesk.
- [ ] **[Learn]** 173. Report checkout or order creation errors to technical support.
- [ ] **[Learn]** 174. Report invoice tax calculation errors.
- [ ] **[Learn]** 175. Report delivery delays or courier conduct issues.
- [x] **[Done]** 176. Contact support through in-app help links.
- [x] **[Done]** 177. Provide unique order or invoice numbers when filing complaints.
- [x] **[Done]** 178. Track return claim ticket resolutions on `/dashboard/invoices`.
- [x] **[Done]** 179. Rate delivery service and order fulfillment quality.
- [x] **[Done]** 180. Update shop details when phone or email changes.

J. Security, compliance, and purchasing controls

- [ ] **[Learn]** 181. Use personal authenticated credentials to access the pharmacy account.
- [ ] **[Learn]** 182. Never share portal passwords or OTP codes with third parties.
- [x] **[Done]** 183. Recover forgotten passwords using the secure recovery flow (multi-step verification with 6-digit OTP code).
- [x] **[Done]** 184. Ensure shopkeeper can only view their own pharmacy's orders.
- [x] **[Done]** 185. Ensure shopkeeper can only access their own invoices and ledger.
- [ ] **[Learn]** 186. Verify delivery destination address matches licensed pharmacy premises.
- [ ] **[Learn]** 187. Keep wholesale Form 20B and 21B drug licenses current and renewed.
- [ ] **[Learn]** 188. Maintain active GSTIN status and file periodic returns.
- [ ] **[Learn]** 189. Review medicine salt names and indications before dispensing.
- [ ] **[Learn]** 190. Follow Drugs and Cosmetics Act regulations for purchasing scheduled drugs.
- [ ] **[Learn]** 191. Protect downloaded tax invoices and financial statements from unauthorized access.
- [ ] **[Learn]** 192. Report suspicious account activity or unrecognized logins.
- [ ] **[Learn]** 193. Report any unrecognized order appearing in the order history.
- [ ] **[Learn]** 194. Report unauthorized changes to shop profile or bank details.
- [ ] **[Learn]** 195. Remit payments only through authorized distributor bank/UPI channels.
- [ ] **[Learn]** 196. Do not rely solely on mobile screenshots as proof of settled payment.
- [ ] **[Learn]** 197. Preserve payment UTR references and bank deposit slips.
- [x] **[Done]** 198. Follow the approved digital claims workflow for returning damaged medicines.
- [x] **[Done]** 199. Review account verification status and credit ceiling restrictions.
- [ ] **[Learn]** 200. Complete annual license re-verification requests when required by distributor.
