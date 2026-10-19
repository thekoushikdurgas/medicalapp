# Pharmacy Fantasy — Complete Role & Responsibility Specification

Pharmacy Fantasy should operate as a complete B2B pharmaceutical wholesale management system: from user registration and supplier stock receiving to retailer orders, warehouse picking, delivery, invoicing, payments, returns, and financial reporting.

You listed five user roles, not four. Each role should have its own dashboard, navigation, permissions, work queue, and responsibilities.

[Crown icon](https://images.openai.com/static-rsc-4/YYO1dfW4bLEpbzN1AfIkXQvqnucvAsBL-Ylo_Ig6WEtNhC7e7ls3ybVRu4B7llLP7SXiS-Iy3Ks3jaKVWhtGOwRuiwj6VAJ-Bzqzh0a5WV1QRx4GlnB82Yf_xoG2QNHwp1XvygTJRnxNYRlYyX9Svys-KElvgrei4Pf4ImTGyBk83BKPBxPYfbjoGAsMCRHh?purpose=inline)

1\. 👑 Super Admin

System owner · Global control

Controls users, security, business configuration, financial oversight, reports, and high-risk overrides across the entire platform.

[Shield Gear Icon Vector Illustration Stock Vector by ©MuhammadAtiq 576715336](https://images.openai.com/static-rsc-4/2FfiF-AngTrFHtmqRYDwKAwrxeGaoAztfJPN9Kcz-17mIITwT304G73kyhVhwLWgMhTDt8rtK5dKS-ur_-MWbdlJX0PvHH4-aLCgN7iK9Yq1N6CBkjrjcSeWmYdn1V_vWKjPE2psM4nO3Zo3RoQzp0CoJSZge-k5YBcEyURPDmw?purpose=inline)

2\. 🛡️ Operations Admin

Business manager · Daily supervision

Manages staff, retailer onboarding, credit limits, operations, deliveries, business performance, and exceptions, but cannot create or promote Super Admins.

[Stock Glyph Style Icon Design](https://images.openai.com/static-rsc-4/lpC_Tu2CRNNE687MxYTKkdTmfk5eFXCaXnNl5GPVKQZzQYq8hhf8raionZX74L4KBnHl_1V0SZH4vZgKGMipOGH0j3WQ13Hbt-9lx9Xo1vV-_zFB4xiqsSRrNB5VWuFfO1eoJgg_WOXy5A7jQ6W2iIUo1SKCu6DD4relTPbHXgWO43Xn6z4XoHfBcOr_5g-E?purpose=inline)

3\. 📦 Warehouse Staff

Inventory operator · Order fulfilment

Manages medicines, supplier purchase entries, batch stock, expiry control, picking, packing, challans, invoices, returns, and payment receipts.

[Delivery courier riding a blue scooter with a cardboard package isolated on a transparent background](https://images.openai.com/static-rsc-4/jTT66JxQF2IqW7cYx4tT-Xl4pfjL5Yb5LHPKkfoCfXCT0VkGwIVDEWDC_z33PehiYFf2AYEZfJhlh26F4ECWkI47BhUDUiV0Yyf-gQh-VZGlJeVAM3PYmw48BRfNlmap41Zw_agTStKo47MYW6laNSOkcGj4q4vpBWB30Lv-sAk7cFfyq2RtLXKhvBA1KPJU?purpose=inline)

4\. 🛵 Delivery Boy

Field logistics · Proof of delivery

Handles assigned deliveries, carton pickup, route execution, delivery status, recipient confirmation, signatures, and assigned payment collection.

[Pharmacy on Transparent Background](https://images.openai.com/static-rsc-4/HdhaDPnRdL6-6ndeLdfXA0BwAu-uI5zt46lY9CMSgZU6SCBFtcjG2Hke5BAlglhKeqGC-G4iy7IO5ugaxZ43fNqzwEfedCBj9-d48tTxjf6JTe05r6V7yY2ysnrfUTpKBkKZr3vxj2imxOyt5CvEfZvypfANJwDauEceAaHTqKRvZ1Od6KXTc2Gs-_W61KHO?purpose=inline)

5\. 🏪 Retail Shopkeeper

Wholesale customer · Ordering portal

Browses the medicine catalogue, places wholesale orders, checks credit availability, tracks deliveries, downloads invoices, and reviews payments and account balances.

The responsibilities below are grounded in your uploaded Pharmacy Fantasy role, project, API, database, and screen specifications. Where the existing documentation does not define a complete workflow, I identify the recommended behaviour separately.&#x20;

ROLES.md

PROJECT.md

## 1. 👑 Super Admin — Complete Responsibilities

Primary objective: Own and govern the entire Pharmacy Fantasy platform. This role must be able to oversee every business operation without depending on another user for system-level authority.

### A. Global dashboard

The Super Admin dashboard should provide an overall view of the business.

- Total sales today, this month, and across a selected date range.
- Total orders and orders awaiting fulfilment.
- Total active retailers, staff, warehouse users, and delivery personnel.
- Current stock valuation and stock movement, where valuation data is available.
- Low-stock medicines and batches approaching expiry.
- Retailer outstanding balances and overdue accounts.
- Pending deliveries, failed deliveries, and unresolved delivery disputes.
- Purchase expenditure, gross sales, discounts, returns, and collections.
- GST invoice and credit-note summaries.
- Critical operational alerts, failed background jobs, and security events.

Every metric should open the underlying records. A number on the dashboard must be traceable to orders, inventory batches, invoices, payments, or another source record.

### B. User and role governance

The Super Admin has the highest authority over user accounts.

- Create, edit, deactivate, and reactivate Operations Admins.
- Create and manage Warehouse Staff accounts.
- Create and manage Delivery Boy accounts.
- Create and manage Retail Shopkeeper accounts.
- Create additional Super Admin accounts when explicitly necessary.
- Assign and change roles.
- Search and filter the full user directory.
- Review registration details, account history, and active status.
- Reset credentials through a secure recovery process.
- Revoke sessions and investigate suspicious account activity.
- Review who created a user, changed a role, or deactivated an account.

Important: Role changes must take effect server-side, not merely hide or show frontend menu items. A user whose access has been revoked should not continue using an old session.

### C. Business and system settings

The Super Admin should manage global configuration, including:

- Company name, address, GSTIN, and applicable drug-licence details.
- Warehouse and branch configuration.
- Invoice and delivery-challan numbering rules.
- Product categories, default tax settings, and business defaults.
- Order processing and cancellation rules.
- Delivery service areas and operational policies.
- Credit-control policies and approval thresholds.
- Notification settings and escalation rules.
- Access policies, authentication controls, and audit retention.
- Integration and reporting settings.

Changes affecting tax, invoicing, financial records, or access control should be logged and protected against accidental changes.

### D. Financial and commercial oversight

- Inspect sales, purchases, discounts, and returns.
- Review retailer-wise outstanding balances.
- Audit advance-payment receipts and collection records.
- Review invoices and credit notes.
- Monitor collection discrepancies and disputed balances.
- Authorize exceptional credit-limit overrides.
- Review financial adjustments and their justifications.
- Export financial reports for accounting and reconciliation.

A Super Admin should be able to approve exceptional corrections, but the system should never silently overwrite an old transaction. Corrections should create an auditable adjustment.

### E. Full operational visibility

The Super Admin can inspect and intervene in:

- Product catalogue and stock batches.
- Supplier inward purchase entries.
- Order status and FEFO batch allocation.
- Picking, packing, and dispatch operations.
- Delivery assignments and failed deliveries.
- Delivery challans, invoices, and returns.
- Retailer account and payment histories.
- Staff productivity and system audit logs.

The uploaded RBAC specification gives the Super Admin full global authority, including credit-limit overrides and oversight of disputed deliveries.&#x20;

ROLES.md

### F. Mandatory safeguards

Even this role should not be able to:

- Delete a completed invoice or delivery record without a controlled correction procedure.
- Alter another user's password by directly viewing the stored credential.
- Mark medicines as delivered without required proof or an explicitly recorded exception.
- Change an audit record after it has been written.
- Make untraceable financial adjustments.

Require stronger authentication for sensitive actions and record the actor, timestamp, reason, old value, and new value.

Recommended sidebar: Dashboard · Users & Roles · Products · Inventory · Suppliers · Orders · Deliveries · Invoices & Challans · Retailers · Payments & Ledger · Reports · Audit Logs · Settings · Security.

## 2. 🛡️ Operations Admin — Complete Responsibilities

Primary objective: Keep the business running correctly every day, supervise staff, manage retailers, and resolve operational problems.

The Operations Admin has broad operating authority, but cannot create or assign the `SUPER_ADMIN` role.&#x20;

ROLES.md

### A. Operations dashboard

Show the current state of the business rather than only high-level statistics.

- New wholesale orders awaiting attention.
- Orders delayed during picking or packing.
- Deliveries waiting for assignment.
- Deliveries in transit or marked failed.
- Low-stock and near-expiry alerts.
- Retailers awaiting business-document verification.
- Accounts approaching or exceeding credit limits.
- Outstanding payments and collection discrepancies.
- Daily sales and collection summaries.
- Staff workloads and unresolved operational exceptions.

The Admin should see both the number of problems and the records that require action.

### B. Staff administration

- Create Warehouse Staff accounts.
- Create Delivery Boy accounts.
- Create Retail Shopkeeper accounts.
- Edit staff contact and profile details.
- Activate or deactivate permitted accounts.
- Assign or change roles other than Super Admin.
- Assign delivery personnel to orders.
- Review staff workload and completion status.
- Investigate operational complaints.

For accountability, critical actions should be attributable to the Admin who performed them.

### C. Retailer onboarding and verification

The Operations Admin should maintain the retailer directory, including:

- Shop name and owner name.
- Phone number and email.
- Shop address, area, and city.
- GSTIN, where applicable.
- Drug licence information.
- Verification status and supporting documents.
- Credit limit and outstanding balance.
- Last order and last payment dates.
- Account status and any restrictions.

Recommended review actions:

- Approve a verified retailer.
- Return an incomplete application for correction.
- Reject an application with a documented reason.
- Suspend ordering when a licence or account issue requires investigation.
- Update business information without erasing previous values.

Important design decision: Keep profile verification separate from credit approval. A retailer may be verified but still require a zero or low credit limit.

### D. Credit-limit management

This is one of the most important Admin responsibilities.

The system should show:

- Approved credit limit.
- Current outstanding balance.
- Order value being requested.
- Remaining credit headroom.
- Overdue invoices and payment history.
- Previous credit-limit changes.

For example, if a retailer has a credit limit of ₹50,000, outstanding debt of ₹32,000, and a new order of ₹12,000, the projected outstanding balance is ₹44,000. The order fits within the limit, assuming there are no other reservations or financial adjustments.

The core rule in your specification is:

\\[ \text{Outstanding Balance} + \text{Order Net Total} \leq \text{Credit Limit} \\]

The backend must perform this validation when placing the order. It should not depend only on a frontend calculation.&#x20;

backend.md

The Admin should be able to approve a higher limit, reduce a limit, restrict credit purchases, or request further review. Every change should have a reason and a record of the previous limit.

### E. Order and dispatch supervision

- View the complete order queue.
- Investigate delayed orders.
- Ensure warehouse staff are processing orders in the correct sequence.
- Review stock shortages and failed batch allocations.
- Assign delivery personnel to packed orders.
- Monitor dispatch status and late deliveries.
- Review failed deliveries and retailer complaints.
- Coordinate returns and replacements.
- Escalate financial or stock discrepancies.

Warehouse Staff should remain the primary owners of normal picking, packing, and stock handling. The Admin supervises these activities and uses elevated permissions when intervention is necessary.

### F. Financial and performance reporting

- Daily, weekly, and monthly sales.
- Sales by retailer, medicine, category, and staff activity.
- Retailer outstanding balances and payment collections.
- Stock movement and low-stock reports.
- Near-expiry and expired-stock reports.
- Order fulfilment time and delivery success rate.
- Returns, credits, discounts, and collection discrepancies.
- GST reporting and exports, subject to authorised access.

Recommended sidebar: Dashboard · Users · Shopkeepers · Products · Inventory · Orders · Deliveries · Invoices & Challans · Payments & Ledger · Reports.

The uploaded screen inventory already anticipates Admin views for sales analytics, retailer credit ceilings, stock movement, orders, and statutory reporting.&#x20;

pages.md

## 3. 📦 Warehouse Staff — Complete Responsibilities

Primary objective: Maintain accurate physical stock and fulfil every accepted wholesale order correctly, safely, and on time.

Warehouse Staff are not merely stock-entry operators. In Pharmacy Fantasy, they are responsible for the main operational chain from receiving medicines to handing packed cartons over for delivery.

Your documentation grants this role extensive operational permissions for products, inventory, orders, invoices, challans, returns, and advance receipts.&#x20;

ROLES.md

### A. Warehouse dashboard

The first screen should answer: What must I process now?

Display:

- New orders waiting for confirmation.
- Confirmed orders waiting for picking.
- Orders currently being picked.
- Orders waiting to be packed.
- Packed orders waiting for dispatch.
- Supplier deliveries awaiting inward entry.
- Low-stock products.
- Batches nearing expiry in 90, 60, and 30 days.
- Damaged, expired, or quarantined medicines.
- Pending challan returns and invoice returns.
- Pending invoices and payment receipts requiring attention.

Prioritise urgent actions, such as a new order, a dispatch deadline, or a stock discrepancy, rather than presenting all information with equal importance.

### B. Product catalogue management

Warehouse Staff should be able to create and maintain medicine SKUs.

For each product, capture:

- Brand or product name.
- Active ingredient and composition.
- Manufacturer.
- Pack size, such as `10S`, `15S`, or `60ML`.
- Pharmaceutical category.
- HSN code.
- Default MRP.
- Applicable default SGST and CGST rates.
- Active or inactive status.
- Relevant prescription or regulatory classification, where applicable.

Important distinction: A product is the medicine definition; a stock batch is a particular quantity of that medicine with its own batch number, expiry date, and commercial rates.

Do not create a separate product every time the same medicine arrives from a supplier. Create a new batch under the existing SKU unless the medicine's actual product identity or pack configuration differs.

### C. Supplier management and inward stock

The warehouse must record goods received from pharmaceutical distributors.

The workflow should be:

1. Select or enter the supplier.
2. Enter the supplier invoice number and invoice date.
3. Add each medicine and verify its product identity.
4. Record the manufacturer batch number and expiry date.
5. Enter received quantity and free quantity.
6. Capture purchase rate, MRP, and permitted discounts.
7. Check the invoice against the physical delivery.
8. Record damaged, missing, excess, or rejected units separately.
9. Confirm the inward entry.
10. Update the inventory only for the quantity accepted into the appropriate stock status.

Every inward transaction should preserve its supplier invoice reference and the staff member who recorded it.

Recommended controls: prevent duplicate supplier-invoice submissions, require correction approval for confirmed entries, and keep a traceable discrepancy record when physical quantities do not match the supplier bill.

### D. Batch-level inventory management

Each batch should maintain its own:

- Product ID.
- Batch number.
- Expiry date.
- Purchase rate.
- Applicable selling rate and MRP.
- Received, free, available, reserved, and dispatched quantities.
- Supplier invoice reference.
- Receipt timestamp.
- Batch condition and stock status.

Warehouse Staff should be able to inspect exact available quantities, view expiry warnings, and make permitted stock adjustments.

Every adjustment should include a reason, such as:

- Physical count mismatch.
- Broken packaging.
- Damaged goods.
- Expired stock.
- Supplier shortage.
- Approved stock return.
- Data-entry correction.

Never allow a stock adjustment to modify quantities without maintaining the original quantity, adjusted quantity, reason, actor, and timestamp.

### E. Expiry monitoring and FEFO

Pharmacy Fantasy should use FEFO — First-Expiry-First-Out for eligible inventory.

When confirming an order, the system should allocate available units from the earliest-expiring eligible batches first, while excluding expired, blocked, quarantined, or otherwise ineligible stock.

The existing backend specification explicitly describes expiry-based allocation and an advisory when less than 60 days of shelf life remain. The UI specification further defines warning bands at 30, 60, and 90 days.&#x20;

backend.md

pages.md

Warehouse Staff should be able to:

- Review the batch allocation before picking.
- Identify an order that cannot be fulfilled from available stock.
- View remaining shelf life.
- Separate expired or damaged stock from saleable stock.
- Inspect rejected FEFO allocations and their reasons.
- Prepare expiry or damage reports.
- Request stock replenishment.

Recommended safeguard: Do not permit staff to override the FEFO sequence silently. If business rules require a different allocation, capture the authorised exception and its reason.

### F. Wholesale order processing

The normal order sequence should be:

1\. Review new order

Verify retailer, medicines, quantities, requested delivery details, and order remarks.

2\. Confirm stock allocation

Validate availability, reserve eligible stock batches, and confirm the order.

3\. Pick medicines

Generate a picking list, identify the correct racks and batches, and record quantities picked.

4\. Verify and pack

Compare picked products against the order, inspect packaging, record carton counts, and seal the shipment.

5\. Prepare dispatch documents

Generate the required delivery challan and invoice at the appropriate business stage.

6\. Handover to delivery

Verify the packed shipment, courier identity, carton count, and dispatch documents before handover.

Each stage should have a controlled status transition. Staff must not be able to mark an order as packed if required products remain unpicked, for example.

### G. Invoices and delivery challans

Warehouse Staff should:

- Generate and inspect statutory tax invoices.
- Verify retailer details, quantities, rates, discounts, taxable values, and applicable taxes.
- Preview, print, and download invoice PDFs.
- Create delivery challans for packed orders.
- Record the transporter or delivery person, vehicle number, and carton count.
- Print or digitally share dispatch documents.
- Retrieve historical documents without recreating them.
- Handle document corrections through an authorised process.

Your documentation defines separate invoice and challan workflows, with identifiable invoice and challan numbers. It also describes separate pre-invoice challan returns and post-invoice credit-note processing.&#x20;

pages.md

### H. Returns processing

There are two materially different return workflows.

1\. Challan return — before invoice finalisation

Examples include goods rejected at the loading bay or rejected during transit before invoice settlement.

Warehouse responsibilities:

- Record the original challan.
- Select the returned products and original batches.
- Record quantities and rejection reasons.
- Inspect the physical goods.
- Generate a return reference.
- Restore accepted units to the correct stock state.
- Send damaged or doubtful goods to quarantine.

2\. Invoice return — after invoicing

Warehouse responsibilities:

- Select the original invoice.
- Identify returned invoice lines and batches.
- Record quantities and the return reason.
- Determine whether units are eligible for restocking.
- Calculate the applicable credit note and GST reversals.
- Update the retailer's ledger through the authorised accounting workflow.
- Quarantine or scrap ineligible stock.
- Generate and retain the credit-note document.

A return must never restore the entire quantity to saleable stock just because a return record exists. Physical inspection and the permitted disposition must determine the inventory treatment.

### I. Payments and daily closing

Warehouse Staff may record advance receipts from shopkeepers using the supported payment methods, such as cash, UPI, cheque, or bank transfer.

They should also:

- Generate a receipt number.
- Record the retailer and amount.
- Capture the payment method and reference number.
- Link the receipt to the relevant account.
- Verify the balance change.
- Reconcile recorded receipts with cash and bank evidence.
- Review unresolved discrepancies before ending the shift.

For delivery collections, the warehouse should reconcile the amount actually handed over by the Delivery Boy with the amount recorded against the customer account.

Recommended sidebar: Dashboard · Products · Supplier Purchases · Inventory & Batches · Orders & Picking Queue · Deliveries & Dispatch · Invoices & Challans · Returns & Credit Notes · Advance Payments · Stock Reports.

## 4. 🛵 Delivery Boy — Complete Responsibilities

Primary objective: Deliver the correct medicines to the correct retailer, maintain shipment accountability, and produce reliable proof of handover.

This role should have a simple, mobile-first experience. A Delivery Boy should not need access to a complicated administrative dashboard.

### A. Delivery dashboard

Display only relevant operational information:

- New delivery assignments.
- Deliveries awaiting pickup.
- Deliveries in transit.
- Deliveries completed today.
- Failed or interrupted deliveries requiring action.
- Retailer name, address, and contact number.
- Order number, challan number, and carton count.
- Applicable delivery instructions.
- Payment-collection instructions, where assigned.

The driver should be able to open a destination in a navigation application or call the retailer directly.

### B. Assigned delivery management

A Delivery Boy should only see their own assigned deliveries.

For each assignment, the mobile screen should show:

- Order number.
- Retail pharmacy name.
- Destination address and contact details.
- Carton count and shipment references.
- Assigned challan and relevant delivery documents.
- Delivery notes.
- Current status.
- Pickup and expected delivery information, when available.

They must not be able to browse the entire retailer directory or inspect unrelated customers' financial histories.

### C. Warehouse pickup

At pickup, the Delivery Boy should:

1. Open the assigned delivery.
2. Verify the order and dispatch reference.
3. Check the carton count.
4. Compare the physical shipment against the handed-over documents.
5. Report missing, damaged, or mismatched cartons before accepting the shipment.
6. Confirm the handover from the warehouse.
7. Update the delivery to `PICKED_UP`.
8. Start the trip and transition to `IN_TRANSIT`.

The system should record the driver and time of each transition.

### D. Delivery at the retail pharmacy

At the destination, the Delivery Boy should:

- Verify the intended pharmacy and recipient.
- Confirm that the shipment has reached the correct destination.
- Record whether the goods were accepted in full or partially rejected.
- Capture a shopkeeper or authorised recipient signature.
- Capture a supporting image when required and permitted.
- Record delivery notes or an exception reason.
- Confirm the handover only after completing the required evidence.
- Upload the proof of delivery to the server.

The existing specification includes a digital signature pad and supports signature or proof-image data in the delivery update workflow.&#x20;

API.md

### E. Proof of delivery (POD)

The POD record should preserve:

- Delivery assignment ID.
- Order and retailer reference.
- Driver identity.
- Delivery timestamp.
- Recipient name or confirmation.
- Signature or approved proof image.
- Delivery notes.
- Any partial rejection or exception reference.

A delivery must not become `DELIVERED` merely because the driver pressed a button. The backend should verify that valid required proof has been submitted.

### F. Failed delivery and exceptions

Possible failure reasons include:

- Shop closed.
- Retailer unavailable.
- Address incorrect.
- Recipient refused the shipment.
- Carton count mismatch.
- Goods visibly damaged.
- Delivery could not be completed for another documented reason.

The Delivery Boy should choose a reason, enter notes, and provide evidence where appropriate.

The system should mark the assignment as `FAILED` when applicable, preserve any relevant evidence, and notify the warehouse or Operations Admin. A failed delivery must not automatically become a completed sale or trigger incorrect payment settlement.

Where only part of a shipment is rejected, use a controlled partial-delivery or return workflow rather than treating the whole order as successfully delivered.

### G. Cash and UPI collection

Your role documentation mentions that Delivery Boys may collect payments at the shop and hand the money over to the warehouse cashier.&#x20;

ROLES.md

The mobile interface should therefore support:

- Viewing the collection amount assigned to a delivery.
- Recording cash collected.
- Recording UPI payment references or confirmation evidence.
- Showing whether the collection is pending, collected, or handed over.
- Recording a partial collection where permitted.
- Recording a reason for an unpaid balance.
- Obtaining a warehouse handover confirmation.

Important implementation requirement: Your current API documentation does not define a complete, separate delivery-collection reconciliation workflow. Add a dedicated collection record and reconciliation operation. The Delivery Boy must not directly edit the retailer's outstanding balance.

### H. End-of-day delivery closing

At the end of the shift:

- All assigned deliveries should have a clear status.
- Completed deliveries must have their required POD evidence.
- Failed deliveries must include reasons.
- Collected money must be accounted for.
- Unhanded-over cash must remain visibly outstanding.
- Pending cartons and documents must be returned or reconciled.
- Delivery assignments should be closed only when the required conditions are met.

Recommended sidebar: My Deliveries · Current Trip · Completed Deliveries · Failed Deliveries · Payment Collections · Delivery History · My Profile.

## 5. 🏪 Retail Shopkeeper — Complete Responsibilities

Primary objective: Give an independent pharmacy a reliable way to order medicines wholesale, track fulfilment, and manage its account with the distributor.

The shopkeeper's workspace must be much simpler than the warehouse workspace. It should focus on buying medicines and knowing exactly what has been ordered, delivered, billed, and paid.

### A. Registration and pharmacy profile

The registration form should capture:

- Owner or contact person's full name.
- Phone number and email, where available.
- Shop or pharmacy name.
- Full shop address.
- Area and city.
- GSTIN, where applicable.
- Drug licence number and supporting documents, as required by the onboarding policy.
- Password and secure login details.

The profile page should allow the retailer to update ordinary contact information and request corrections to sensitive business or licensing information.

The retailer should be able to see its verification status, outstanding document requests, and the reason an account is restricted.

Recommended onboarding policy: Separate registration, identity or business verification, and credit approval. A newly registered shopkeeper should not automatically receive a high credit limit simply because an account was created.

### B. Medicine catalogue

The shopkeeper should be able to search the wholesale catalogue by:

- Brand name.
- Active ingredient or composition.
- Manufacturer.
- Pack size.
- Category.
- Availability.

Each product listing should clearly show the commercially relevant information:

- Medicine and pack name.
- Composition.
- Pack size.
- MRP.
- Retailer's applicable trade rate.
- Permitted trade discount or scheme.
- Availability status.
- Minimum order quantity, if a business rule exists.
- Quantity selector.

Retailers should see enough availability information to decide whether to order, but should not gain access to internal rack locations, supplier costs, unrelated retailer prices, or private operational records.

The source screen inventory defines retailer catalogue access and trade pricing, while detailed exact batch quantities are intended for warehouse users.&#x20;

pages.md

ROLES.md

### C. Shopping cart and order placement

The shopping experience should work as follows:

1. Search and select medicines.
2. Choose the pack quantity.
3. Review applicable prices and trade discounts.
4. Review available stock and scheme eligibility.
5. Enter delivery instructions or remarks.
6. Review the order subtotal, discount, tax, and payable amount.
7. Review credit-limit headroom.
8. Confirm and place the order.
9. Receive an order number and confirmation.
10. Track the order through fulfilment and delivery.

Before accepting the order, the backend should verify product eligibility, stock rules, pricing, applicable tax calculations, and the retailer's credit limit.

If an order exceeds the credit limit, the system should explain the problem and show the amount of additional payment or authorised credit required. It should not accept an order that fails the credit policy.

### D. Order tracking and cancellation

The retailer should be able to view:

- Order number and placement date.
- Medicine line items and quantities.
- Order amount, discounts, and taxes.
- Current order status.
- Order confirmation status.
- Packing and dispatch progress.
- Delivery assignment progress, where suitable.
- Invoice and challan references.
- Delivery proof or confirmation after completion.

The normal progression is:

`PLACED → CONFIRMED → PICKING → PACKED → DISPATCHED → DELIVERED`

Your schema also defines `CANCELLED`, and the role specification allows the shopkeeper to cancel before confirmation.&#x20;

DATABASE.md

ROLES.md

Cancellation should stop once fulfilment reaches a stage at which the shipment cannot safely be reversed through ordinary cancellation. Later problems should use the dispatch-return or invoice-return process, as appropriate.

### E. Invoice and document history

The retailer should be able to:

- View its own invoices.
- Search invoices by number and date.
- See itemised goods, trade discounts, taxable value, and taxes.
- Download and print invoice PDFs.
- View relevant delivery challans.
- View issued credit notes.
- See the order and delivery associated with each document.

An invoice must not be editable by the retailer. If the retailer disputes an amount, the interface should provide a dispute or support workflow rather than allow direct modification.

### F. Payments and account ledger

The ledger should show every significant account transaction.

| Transaction         | What the shopkeeper should see           |
| ------------------- | ---------------------------------------- |
| Invoice             | Debit charged to the account             |
| Payment             | Amount received and balance impact       |
| Advance receipt     | Receipt number and payment method        |
| Credit note         | Return-related credit applied            |
| Adjustment          | Recorded reason and authorised reference |
| Outstanding balance | Current net amount owed                  |
| Credit limit        | Approved ceiling and available headroom  |

The retailer should be able to inspect historical entries and download a statement for a selected date range.

Where supported, payment methods should include cash, UPI, cheque, and bank transfer. Payment status must distinguish an entered transaction from a verified or reconciled payment.

### G. Returns and complaints

Recommended retailer capabilities include:

- Submit a return request.
- Choose the original order and medicine line.
- Record the requested quantity.
- Select a return reason.
- Add notes and supporting photographs, where useful.
- Track approval and inspection status.
- Review the final credit note or replacement decision.

Do not automatically grant a credit note when a retailer submits a request. The authorised team should inspect eligibility, quantities, batch details, and relevant business rules before approving the financial and inventory changes.

### H. Retailer profile and notifications

Provide timely updates for:

- Order placed and confirmed.
- Order delayed or unavailable.
- Shipment dispatched.
- Delivery completed or failed.
- Invoice issued.
- Payment recorded.
- Credit limit reached or changed.
- Return approved or rejected.
- Required licence or business information needing attention.

Recommended sidebar: Dashboard · Medicines Catalogue · Cart · My Orders · Deliveries · Invoices & Challans · Returns · Payments & Ledger · My Pharmacy Profile · Help & Support.

## 6. How all five roles work together

The most important part of Pharmacy Fantasy is not the individual dashboards. It is making sure every role hands work over to the correct next role without losing stock accuracy, document integrity, or financial accountability.

Super Admin & Operations Admin

Configure, onboard, approve, supervise and audit

Warehouse Staff — Receive stock

Supplier invoice → Batch verification → Stock entry

Retail Shopkeeper — Place order

Catalogue → Cart → Pricing → Credit check → Order placed

Warehouse Staff — Fulfil order

Confirmation → FEFO allocation → Picking → Packing → Documents

Delivery Boy — Deliver goods

Pickup → Transit → Retailer handover → Proof of delivery

Retailer account & financial reconciliation

Invoice → Payment → Ledger update → Returns and credits, when applicable

This sequence follows your documented order lifecycle, stock allocation, delivery, invoicing, and ledger workflows.&#x20;

PROJECT.md

## 7. Permission matrix — who can do what?

This is the proposed operational access baseline, consistent with your role specification.

| Capability                         | Super Admin          | Operations Admin               | Warehouse                 | Delivery Boy             | Shopkeeper          |
| ---------------------------------- | -------------------- | ------------------------------ | ------------------------- | ------------------------ | ------------------- |
| Manage all users                   | Yes                  | Except Super Admin             | No                        | No                       | No                  |
| Change user roles                  | All roles            | Except Super Admin             | No                        | No                       | No                  |
| Manage products                    | Yes                  | Yes                            | Yes                       | No                       | Browse              |
| Manage stock batches               | Yes                  | Yes                            | Yes                       | No                       | Availability only   |
| Place wholesale orders             | Oversight            | Oversight                      | Process                   | No                       | Own orders          |
| Confirm orders and allocate FEFO   | Yes                  | Yes                            | Yes                       | No                       | No                  |
| Pick and pack goods                | Oversight/override   | Supervise/override             | Yes                       | No                       | No                  |
| Assign delivery personnel          | Yes                  | Yes                            | Yes                       | No                       | No                  |
| View assigned deliveries           | Oversight            | Oversight                      | Operational view          | Own assignments          | Own delivery status |
| Capture delivery signature         | Exceptional handling | Exceptional handling           | No                        | Yes                      | Signs at handover   |
| Create invoices and credit notes   | Yes                  | Yes                            | Yes                       | No                       | View own            |
| Record advance receipts            | Yes                  | Yes                            | Yes                       | No                       | View own            |
| Record delivery collection         | Oversight            | Oversight                      | Reconcile                 | Assigned collection only | View own account    |
| Override credit limits             | Yes                  | Approved operational authority | No                        | No                       | No                  |
| View global reports and audit logs | Yes                  | Authorised reports/logs        | Operational stock reports | Own activity             | Own account         |

A row labelled “oversight/override” does not mean staff should bypass normal checks. It means elevated users can inspect operations and use specifically authorised exception workflows.

The role documents explicitly establish the Super Admin ceiling, Admin role restriction, warehouse operational authority, and retailer credit guard.&#x20;

ROLES.md

## 8. Essential rules the system must enforce

These are the controls I would prioritise before adding more features.

1\. Server-side role enforcement

Every protected API operation must validate the authenticated user's identity, role, permissions, and record ownership. Hiding a menu item in the frontend is not security.

2\. Ownership-based data access

A Shopkeeper must not view another shop's orders, invoices, or ledger. A Delivery Boy must not open another driver's assignments or upload proof against an unrelated order.

3\. Atomic stock and order operations

Stock reservation, FEFO allocation, order confirmation, and inventory changes must remain consistent under concurrent requests. Failed operations must roll back properly, rather than leave partial stock movements.

4\. Financial auditability

Invoices, receipts, credit notes, and account adjustments must have immutable history or controlled reversals. Avoid directly overwriting completed financial records.

5\. Valid status transitions

The backend must reject transitions that do not make operational sense—for example, marking an unpicked order as packed or marking an assignment delivered before its required proof is validated.

6\. Audit high-risk actions

Record the actor, timestamp, affected record, reason, and relevant before-and-after values for role changes, credit overrides, stock adjustments, returns, and financial corrections.

Your existing role architecture already calls for validated JWT identity, restrictions on Super Admin creation, delivery-proof validation, and credit-limit enforcement. These rules should be applied consistently to every related query and mutation.&#x20;

ROLES.md

## 9. Important gaps to resolve before implementation

I would resolve these design issues explicitly rather than let different pages or API developers implement them differently.

| Issue                                               | Recommended decision                                                                                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Shopkeeper registration versus licence verification | Allow registration, but separate account creation from verified ordering and credit eligibility.                                            |
| Delivery Boy self-registration                      | Create a pending or restricted account until the operational onboarding checks are complete.                                                |
| Credit limit defaulting to ₹0                       | Require an explicit credit policy before enabling credit-based ordering. Permit prepaid ordering only if that is a supported business rule. |
| Payment collection by Delivery Boy                  | Define a dedicated collection record, payment evidence, cashier handover, and reconciliation workflow.                                      |
| Delivered status                                    | Validate assignment ownership and proof on the backend; keep exceptions auditable.                                                          |
| Cancellation and returns                            | Define the final permitted cancellation stage and separate pre-invoice returns from post-invoice credit notes.                              |
| Stock write-offs and corrections                    | Record reasons and quantities; require additional approval for sensitive adjustments.                                                       |
| GST and invoice calculations                        | Define applicable tax rules per product and transaction, with validated rounding and controlled corrections.                                |
| Admin overrides                                     | Require reason capture and audit logging for sensitive actions.                                                                             |
| User deactivation                                   | Revoke active sessions promptly and block new protected operations.                                                                         |

Two especially important findings from your existing documents:

First, the registration screen specification describes instant self-service access for Shopkeepers and Delivery Boys, while the role specification also expects retailer licence and GSTIN verification. The policy should clearly distinguish registration from approval rather than grant unrestricted access immediately.&#x20;

pages.md

ROLES.md

Second, the API accepts identifiers such as `shopkeeperId` and `deliveryBoyId` in certain operations. The backend must validate these against the authenticated identity and authorised scope instead of trusting an ID supplied by the client.&#x20;

API.md

API.md

## 10. Final recommended structure

For a clean implementation, I would divide the product into five role-aware workspaces built on one shared backend:

- Super Admin workspace: Global governance, security, settings, financial oversight, reporting, and audit.
- Operations Admin workspace: Staff, retailer approvals, credit limits, delivery assignment, exceptions, and operating reports.
- Warehouse workspace: Products, supplier inward entries, batches, FEFO, orders, picking, packing, dispatch documents, returns, and receipts.
- Delivery workspace: Assigned trips, pickup confirmation, route execution, proof of delivery, failed-delivery handling, and payment collections.
- Retailer workspace: Pharmacy profile, product catalogue, wholesale cart, orders, delivery tracking, invoices, returns, payments, and ledger.

Each workspace should be mobile-responsive, show only the permissions relevant to its role, and provide a direct path from a task to its associated record. The underlying database and transaction services should remain shared so all five workspaces operate on the same authoritative stock, order, delivery, and financial records.

My recommendation: Finalise the permission matrix and the end-to-end order, delivery, return, and payment workflows first. Then implement each role's screens against those rules. This will prevent duplicated logic, inconsistent statuses, and permission bugs across Pharmacy Fantasy.
