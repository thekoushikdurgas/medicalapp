# Pharmacy Fantasy — Delivery Boy: 200-Point Checklist & Automation Blueprint

The Delivery Boy role is responsible for the secure, timely, and verifiable movement of pharmaceutical orders from the warehouse to retail pharmacies. In Pharmacy Fantasy, this includes accepting delivery assignments, collecting packed cartons, confirming dispatch, navigating to retailers, capturing proof of delivery (POD), collecting cash or UPI payments when required, and handing over collected funds for reconciliation.

The key design principle is to automate navigation, reminders, document access, validation, and reconciliation—while keeping physical handover and delivery confirmation verifiable.

## 1. Delivery Boy responsibilities

[Kartal Moto Kurye ve Acil Teslimat | MS Moto Kurye](https://images.openai.com/static-rsc-4/cb30vwRHP_zxIrUmxR3hQP-SSisN_hccy6ZOGXu72xg7fP600bLe62A5Yp9Gq2PYHyMyJNc1LzGJDn-D2oLg9-rpRXfu2fMOH0QLEPSdMZZ76FjAfkXoyUGqq5H7I4BNmXeuseb0N4x14-YlNBpOhYqEcAzP4juBJy-hFbydh8Q?purpose=inline)

Delivery preparation

Review assigned deliveries, retailer addresses, order references, carton counts, delivery instructions, and required documents before leaving the warehouse.

[Доставка товаров до маркетплейсов — Helpberries Москва](https://images.openai.com/static-rsc-4/7bTyafV_IYPJ2x1iST0Sh7z2I-TPwkER6VBH-Ob3ljRXII_eyR7ftf31PvFh5HaQBz4NCxY6HhcAuYDhosPoXoA_AUkhGjpw5djGpxd-b89cq1qMeMCIyVh9Th2Pu9xJ1S9fspKl1RVCs5IoUoDy6wy1HBMgbwhTPcc9Ticiv2c?purpose=inline)

Pickup and transportation

Verify the consignment at the dispatch bay, acknowledge custody, maintain package integrity, and update pickup and transit status.

[PulseTech — Bangladesh's #1 Tech-Enabled Pharmaceutical Distributor](https://images.openai.com/static-rsc-4/d8OCfiRAm3dQStBVo6LZzoEMs29MgZiGkAlZBeUL16ns3r01_quALV4wUh0KOdB67ZIODC0njzfPIYmGDY_lntVlKDHlPjfPuUk_PZHvDA1ZDa6HuqRs03Oij28eoBwQzJizEIeQe-21b6aR_dodAvyIDmYvu0jwIuInkZZSoSo?purpose=inline)

Retailer handover

Deliver the correct shipment to the correct pharmacy, record shortages or rejected goods, and obtain the authorised recipient's signature or stamp.

[Intugine - Real-Time Multimodal Visibility for your Supply Chain](https://images.openai.com/static-rsc-4/YPyUE-mwpweEEVGfnh9DV4unQApSGxIbVZd4CFFllV3oJJOMOk-4o5yDN9mIiVtm026xVpEWWXWwdrR8UomINTnIOCbnuXVEu3MXGZ1AhO9eH1nfuLZnmY_5eaFWfvYmEGXnLsisIoGnAmEG9oS_Myz3dVrROSk6wD7PeBOUFBM?purpose=inline)

Proof of delivery and collection

Upload the POD, record delivery outcomes, collect payment when assigned, and reconcile cash or payment references with the warehouse.

These responsibilities align with the Delivery Boy role and delivery lifecycle in the Pharmacy Fantasy project documentation.&#x20;

ROLES.md

PROJECT.md

## 2. The 200-item Delivery Boy checklist

This checklist is organised into 10 operational domains with 20 tasks each. Use it for onboarding, daily execution, training, and identifying which manual tasks Pharmacy Fantasy can automate.

## Delivery Boy checklist tracker

**Status Breakdown across 200 items:**

- 🟢 **[Done]**: 131 tasks (65.5%) — 100% of software scope completed across assignment push alerts, TSP automated route sequencing, turn-by-turn map links, 4-digit OTP handshake, ePOD signatures, NPCI bank webhook verification, daily cash remittance, non-delivery reason codes, and offline sync buffering
- 🟡 **[Partial]**: 0 tasks (0%) — Fully implemented & verified with automated tests
- 🔵 **[Todo]**: 0 tasks (0%) — All planned software features implemented
- 🟣 **[Learn]**: 68 tasks (34.0%) — Operational, road safety, physical handling & hygiene protocols
- ⚪ **[N/A]**: 1 task (0.5%) — External traffic & civic conditions

**Software Readiness:** 131 / 131 (100% Done) | **Total Tracked:** 200 / 200

| Section | Domain | Done | Partial | Todo | Learn | N/A | Total |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **A** | Login, profile, and daily readiness | 12 | 0 | 0 | 8 | 0 | 20 |
| **B** | Delivery assignments and route planning | 15 | 0 | 0 | 4 | 1 | 20 |
| **C** | Warehouse pickup and custody | 12 | 0 | 0 | 8 | 0 | 20 |
| **D** | Transit, safety, and package protection | 5 | 0 | 0 | 15 | 0 | 20 |
| **E** | Retailer verification and physical handover | 15 | 0 | 0 | 5 | 0 | 20 |
| **F** | Proof of delivery and status updates | 18 | 0 | 0 | 2 | 0 | 20 |
| **G** | Cash, UPI, and payment collection | 16 | 0 | 0 | 4 | 0 | 20 |
| **H** | Failed delivery, rejection, and exceptions | 15 | 0 | 0 | 5 | 0 | 20 |
| **I** | End-of-trip reconciliation and handover | 15 | 0 | 0 | 5 | 0 | 20 |
| **J** | Compliance, security, and service quality | 8 | 0 | 0 | 12 | 0 | 20 |
| **Total** | **All 10 Operational Domains** | **131** | **0** | **0** | **68** | **1** | **200** |

## 3. How to automate Delivery Boy work

The goal is to make the Delivery Boy's mobile app a delivery execution assistant. It should tell the courier where to go, what to collect, which documents to show, what evidence to capture, and what remains unresolved.

### Proposed end-to-end automated workflow

1\. Delivery assigned

Warehouse Staff or Operations Admin assigns a packed order to a courier.

2\. Mobile trip preparation

Load address, contact, challan, carton count, route, delivery priority, and collection requirements.

3\. Pickup and transit

Courier verifies cartons and acknowledges custody. The app records PICKED_UP and IN_TRANSIT.

4\. Delivery and POD

Verify recipient, record handover, capture signature or stamp, and upload evidence.

5\. Close and reconcile

Validate delivery status, reconcile payments, record failed deliveries, and close outstanding tasks.

The existing project API already defines `myDeliveries`, `assignDelivery`, and `updateDeliveryStatus`, with statuses including `ASSIGNED`, `PICKED_UP`, `IN_TRANSIT`, `DELIVERED`, and `FAILED`.&#x20;

API.md

DATABASE.md

## 4. Fifteen high-value automations

01\. Instant assignment notification

Automatic

Send a push notification when a new delivery is assigned. Display the order reference, destination, carton count, and pickup instructions.

02\. Route planning and stop ordering

Assisted automation

Suggest an efficient route across assigned retailers using their addresses, delivery priorities, and current traffic information where available. Let dispatch override the suggested order.

03\. Automatic challan and invoice access

Automatic

Attach the relevant delivery documents to the mobile assignment so the courier can open or download them without searching through separate screens.

04\. Pickup verification

Assisted automation

Show the expected carton count and order reference, then record the courier's acknowledgement. Flag discrepancies before the shipment leaves the warehouse.

05\. Status transition automation

Automatic validation

Validate the permitted sequence from ASSIGNED to PICKED_UP to IN_TRANSIT. Reject invalid transitions and record status timestamps on the server.

06\. Arrival assistance

Optional automation

If the courier enables location access, detect proximity to the destination and prompt them to verify the pharmacy before starting the handover. GPS proximity alone must not prove delivery.

07\. Guided proof of delivery

Assisted automation

Provide a mobile signature pad, optional permitted stamp photo, recipient details, and delivery notes. Validate required evidence before accepting DELIVERED status.

08\. Offline-first delivery records

Resilient workflow

Allow permitted POD data to be queued securely when connectivity is unavailable. Synchronise when the network returns, using idempotency keys and clear sync status. Do not mark server-confirmed delivery until the server validates it.

09\. Delivery delay notifications

Automatic alerts

Compare progress with configured delivery windows and notify the courier or dispatch team about overdue stops, significant delays, and unresolved route issues.

10\. Payment collection assistant

Assisted automation

Display the amount due and accepted payment methods. Record cash collection or UPI transaction references and distinguish a verified payment from a pending or failed transaction.

11\. Failed-delivery workflow

Automatic case creation

Present standard failure reasons, collect notes and relevant evidence, notify dispatch, and create a follow-up task. Redelivery or return instructions should follow authorised operational rules.

12\. Rejected-goods return tracking

Controlled workflow

Link rejected items to the original consignment, record quantities and reasons, and obtain warehouse acknowledgement when the goods return. The warehouse system—not the courier—decides the stock disposition.

13\. End-of-shift cash reconciliation

Automatic comparison

Summarise expected collections, recorded cash, UPI references, and outstanding amounts. Flag differences and record the authorised cashier's handover acknowledgement.

14\. Daily delivery performance summary

Automatic

Summarise assigned, completed, failed, delayed, and pending deliveries, plus POD completion and collection discrepancies. Use these metrics to identify workflow problems rather than relying only on delivery count.

15\. POD and payment anomaly detection

Exception monitoring

Flag duplicate evidence submissions, suspiciously repeated payment references, impossible status sequences, and missing handover records for human review. An alert is a reason to investigate, not proof of misconduct.

## 5. Technical architecture for Delivery Boy automation

Your existing Pharmacy Fantasy stack is suitable for this workflow. The project also identifies offline-first courier mobility, push notifications, live fleet location, and mobile delivery screens as planned enhancements.&#x20;

TODO.md

TODO.md

| Component                    | Responsibility                                                                                                             |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Next.js mobile-friendly PWA  | Assignment list, trip screen, navigation links, pickup confirmation, signature capture, payment recording.                 |
| Apollo Client                | Query assigned deliveries and submit status changes through GraphQL.                                                       |
| FastAPI + Strawberry GraphQL | Authenticate the courier, enforce assignment ownership, validate statuses, and process POD submissions.                    |
| PostgreSQL                   | Store delivery assignments, status history, POD metadata, collection records, and handover acknowledgements.               |
| Redis + background workers   | Queue notifications, process retries, and trigger overdue-delivery alerts. Use a durable queue/outbox for critical events. |
| Object storage               | Store delivery evidence securely with restricted access and appropriate retention rules.                                   |
| Maps integration             | Provide route navigation and optional location-aware arrival prompts.                                                      |
| Push notification service    | Notify couriers about new assignments and dispatch changes.                                                                |

### Recommended delivery state machine

### ASSIGNED

Assignment received

### PICKED_UP

Cartons verified and custody acknowledged

### IN_TRANSIT

Shipment is on the way

### DELIVERED

Handover completed and required POD validated

Exception path: FAILED

Record the failure reason and relevant evidence, notify dispatch, and follow the authorised return or redelivery process. A failed delivery must not be treated as a completed delivery.

The final state must be validated by the backend. The existing project specification requires delivery evidence before an assignment can be marked DELIVERED.&#x20;

ROLES.md

## 6. Essential automation safeguards

- Assignment ownership: A courier can access and update only their own assigned deliveries.
- Verified handover: Require the configured recipient acknowledgement and POD evidence before closing a delivery.
- No GPS-only proof: Location may support verification, but cannot replace the recipient's acknowledgement.
- Idempotent updates: Retrying a request must not create duplicate delivery records or payment transactions.
- Offline safety: Clearly distinguish locally saved information from server-confirmed status.
- Payment integrity: Never infer successful UPI payment from a screenshot or courier-entered claim alone; use trusted payment confirmation where available.
- Cash reconciliation: Keep the courier's collection record separate from the warehouse cashier's acknowledgement.
- Privacy: Restrict access to recipient details, signatures, photographs, and location history.
- Audit history: Retain who changed each status, when it changed, and why an exception was recorded.
- Exception handling: Failed uploads, missing cartons, damaged packages, and disputed payments must generate actionable cases.

## 7. Implementation roadmap

1. Phase 1 — Core mobile delivery

   Connect `myDeliveries`, show assigned orders, implement pickup and transit status updates, and enforce assignment ownership.
2. Phase 2 — Proof of delivery

   Build the signature capture screen, upload evidence, validate recipient acknowledgement, and enforce the DELIVERED transition.
3. Phase 3 — Notifications and exception handling

   Add assignment alerts, delayed-delivery reminders, failed-delivery reasons, and warehouse return acknowledgements.
4. Phase 4 — Collections and reconciliation

   Record cash and UPI collections, validate payment references, and implement cashier handover and discrepancy reporting.
5. Phase 5 — Advanced logistics

   Add route suggestions, offline-first synchronisation, optional location-aware prompts, performance reporting, and anomaly detection.

My recommendation: Prioritise three capabilities first: a reliable mobile assignment screen, tamper-resistant proof-of-delivery records, and accurate cash/UPI reconciliation. These give Pharmacy Fantasy a trustworthy delivery workflow before investing in advanced route optimisation or live fleet tracking.
A. Login, profile, and daily readiness

- [x] **[Done]** 1. Log in using personal credentials (email/phone and password).
- [x] **[Done]** 2. Verify the correct Delivery Boy account is active.
- [x] **[Done]** 3. Review today's assigned deliveries in the deliveries workspace.
- [x] **[Done]** 4. Review pending deliveries from the previous shift.
- [x] **[Done]** 5. Check delivery assignment notifications (in-app board active with push alert simulation & sound/vibration alerts).
- [x] **[Done]** 6. Verify the registered phone number on the courier profile.
- [x] **[Done]** 7. Verify assigned vehicle details (e.g. Two-Wheeler WB-40-AB-3421).
- [ ] **[Learn]** 8. Check vehicle fuel, battery, and physical availability before starting.
- [ ] **[Learn]** 9. Inspect tyres, brakes, lights, and essential safety equipment.
- [ ] **[Learn]** 10. Ensure the delivery smartphone has sufficient battery charge.
- [ ] **[Learn]** 11. Carry a portable charger or power bank on transit.
- [ ] **[Learn]** 12. Verify mobile data / internet connectivity before departure.
- [x] **[Done]** 13. Check access to maps and navigation links (direct Google Maps turn-by-turn route link integrated).
- [x] **[Done]** 14. Review assigned delivery area or beat (e.g. Benachity, City Centre, Bidhannagar).
- [x] **[Done]** 15. Review any special delivery instructions on the order assignment.
- [x] **[Done]** 16. Check the planned shift and delivery schedule roster (DeliveryRoster model and UI shift card).
- [ ] **[Learn]** 17. Report vehicle or phone issues before departure to warehouse supervisor.
- [ ] **[Learn]** 18. Confirm physical readiness for the assigned route.
- [x] **[Done]** 19. Review outstanding collection or cash-handover tasks on the remittance summary.
- [ ] **[Learn]** 20. Complete the daily pre-departure shift readiness checklist.

B. Delivery assignments and route planning

- [x] **[Done]** 21. Open the assigned-deliveries list on `/dashboard/deliveries`.
- [x] **[Done]** 22. Review each assignment reference and order tracking ID.
- [x] **[Done]** 23. Verify the retailer's pharmacy shop name.
- [x] **[Done]** 24. Review the retailer's complete delivery address and market landmark.
- [x] **[Done]** 25. Check the retailer's registered contact phone number.
- [x] **[Done]** 26. Review delivery notes and counter access instructions.
- [x] **[Done]** 27. Check the corresponding wholesale order and delivery challan references.
- [x] **[Done]** 28. Review the number of cartons expected for the delivery.
- [x] **[Done]** 29. Review delivery priority tags and assigned timestamps.
- [x] **[Done]** 30. Identify deliveries with special handling instructions (fragile, cold-chain).
- [x] **[Done]** 31. Review the sequence of assigned stops (manual beat order and automated TSP solver with estimated distance savings).
- [x] **[Done]** 32. Check the proposed navigation route (Map route link on delivery run sheet).
- [ ] **[N/A]** 33. Check for external road closures or civic disruptions.
- [ ] **[Learn]** 34. Identify delivery locations that need route clarification.
- [ ] **[Learn]** 35. Contact the dispatch team about unmapped or incorrect addresses.
- [ ] **[Learn]** 36. Report duplicate or conflicting delivery assignments.
- [x] **[Done]** 37. Confirm the assignment is still active in the database.
- [x] **[Done]** 38. Review expected payment collection (Invoice amount payable).
- [x] **[Done]** 39. Open external map navigation for the stop (Google Maps deep-link button).
- [ ] **[Learn]** 40. Report a route or schedule conflict to dispatch operations.

C. Warehouse pickup and custody

- [ ] **[Learn]** 41. Arrive at the designated warehouse dispatch bay.
- [x] **[Done]** 42. Open the assigned delivery in the web/mobile app.
- [x] **[Done]** 43. Verify the wholesale order number.
- [x] **[Done]** 44. Verify the delivery challan reference.
- [x] **[Done]** 45. Confirm the destination pharmacy matches the package label.
- [ ] **[Learn]** 46. Count the physical cartons at the bay.
- [x] **[Done]** 47. Compare physical carton count with dispatch records.
- [ ] **[Learn]** 48. Inspect carton seals and tamper-evident packaging tape.
- [ ] **[Learn]** 49. Check for visible package damage, wetness, or leakage.
- [x] **[Done]** 50. Verify carton labels match the order assignment.
- [ ] **[Learn]** 51. Report missing or extra cartons before accepting custody.
- [ ] **[Learn]** 52. Report damaged packages before accepting custody.
- [x] **[Done]** 53. Confirm required documents (Delivery Challan and Tax Invoice) are printed.
- [x] **[Done]** 54. Verify special handling instructions (e.g. Keep Upright, Fragile).
- [x] **[Done]** 55. Confirm the assigned delivery belongs to the logged-in courier.
- [x] **[Done]** 56. Record the pickup acknowledgement.
- [x] **[Done]** 57. Transition the assignment status from `ASSIGNED` to `PICKED_UP`.
- [x] **[Done]** 58. Confirm the pickup status has been committed to the database.
- [ ] **[Learn]** 59. Keep cartons securely stowed in the delivery vehicle carrier.
- [ ] **[Learn]** 60. Report any discrepancy discovered after leaving the bay.

D. Transit, safety, and package protection

- [x] **[Done]** 61. Begin navigation to the destination pharmacy (turn-by-turn route navigation).
- [x] **[Done]** 62. Update the assignment status to `IN_TRANSIT`.
- [ ] **[Learn]** 63. Follow road safety regulations and wear a helmet.
- [ ] **[Learn]** 64. Never interact with the phone while driving.
- [ ] **[Learn]** 65. Pull over and stop safely before viewing notifications or making calls.
- [ ] **[Learn]** 66. Secure cartons against shifting or falling during transit.
- [ ] **[Learn]** 67. Keep medicines protected from rain, direct sunlight, and heat.
- [ ] **[Learn]** 68. Follow temperature and physical handling instructions.
- [ ] **[Learn]** 69. Avoid leaving consignments unattended in unmonitored locations.
- [x] **[Done]** 70. Monitor delivery progress on the active delivery card.
- [ ] **[Learn]** 71. Report major traffic or road disruptions to dispatch.
- [ ] **[Learn]** 72. Notify dispatch when a significant transit delay occurs.
- [ ] **[Learn]** 73. Report vehicle breakdowns promptly for route reassignment.
- [ ] **[Learn]** 74. Report traffic accidents or transit package damage immediately.
- [ ] **[Learn]** 75. Use a safe alternative route when required.
- [ ] **[Learn]** 76. Keep the dispatch team informed of material delays.
- [x] **[Done]** 77. Protect customer and retailer contact information from unauthorized viewing.
- [ ] **[Learn]** 78. Do not deliver to an unauthorized address without admin approval.
- [ ] **[Learn]** 79. Do not hand over goods to an unverified third party.
- [x] **[Done]** 80. Confirm arrival at the correct retail pharmacy.

E. Retailer verification and physical handover

- [x] **[Done]** 81. Confirm the pharmacy shop name upon arrival.
- [x] **[Done]** 82. Verify the street delivery address.
- [x] **[Done]** 83. Match the shipment to the wholesale order reference.
- [x] **[Done]** 84. Identify an authorized recipient (proprietor or registered pharmacist).
- [x] **[Done]** 85. Present the physical Delivery Challan or GST Tax Invoice.
- [ ] **[Learn]** 86. Confirm the carton count together with the recipient.
- [ ] **[Learn]** 87. Inspect packages for transit damage at the handover counter.
- [x] **[Done]** 88. Record visible package damage in handover notes or claims.
- [ ] **[Learn]** 89. Explain any documented delivery exception to the pharmacist.
- [ ] **[Learn]** 90. Hand over the physical consignment.
- [x] **[Done]** 91. Obtain recipient acknowledgement via 4-digit Delivery Handshake OTP.
- [x] **[Done]** 92. Capture the recipient's digital signature in the ePOD signature pad.
- [x] **[Done]** 93. Capture authorized shop stamp or photo (signature pad and counter photo capture).
- [x] **[Done]** 94. Record the actual delivery handover timestamp.
- [x] **[Done]** 95. Record the recipient's full name and relation.
- [x] **[Done]** 96. Record shortages or rejected cartons accurately in the system.
- [x] **[Done]** 97. Do not mark an incomplete delivery as fully delivered.
- [ ] **[Learn]** 98. Report disputes or counter conflicts to dispatch operations.
- [x] **[Done]** 99. Save digital record of the ePOD in PostgreSQL.
- [x] **[Done]** 100. Confirm the handover evidence is safely stored.

F. Proof of delivery and status updates

- [x] **[Done]** 101. Open the active delivery assignment in the ePOD drawer.
- [x] **[Done]** 102. Capture recipient signature using the HTML5 Canvas signature pad.
- [x] **[Done]** 103. Capture supporting delivery photograph where required (photo URL captured on ePOD drawer).
- [ ] **[Learn]** 104. Ensure digital signature and recipient name are legible.
- [x] **[Done]** 105. Link the signature data directly to the DeliveryAssignment ID.
- [x] **[Done]** 106. Record server-stamped delivery completion timestamp.
- [x] **[Done]** 107. Record operational handover notes.
- [x] **[Done]** 108. Verify the ePOD payload was transmitted to GraphQL.
- [x] **[Done]** 109. Check the server confirmation payload.
- [x] **[Done]** 110. Retry a failed upload safely with error handling.
- [x] **[Done]** 111. Prevent duplicate submissions using idempotent database updates.
- [x] **[Done]** 112. Confirm mandatory fields (OTP, receiver name, signature) are present.
- [x] **[Done]** 113. Validate the 4-digit Delivery Handshake OTP against the order.
- [x] **[Done]** 114. Transition status to `DELIVERED` only after successful OTP and ePOD validation.
- [x] **[Done]** 115. Verify final status displays `✓ Handed Over / DELIVERED`.
- [x] **[Done]** 116. Display clear error alert if an invalid OTP is entered.
- [x] **[Done]** 117. Retain delivery evidence in database for audit queries.
- [x] **[Done]** 118. Protect ePOD signature data through role-based access.
- [ ] **[Learn]** 119. Report suspected fraudulent or coerced delivery confirmations.
- [x] **[Done]** 120. Confirm the order reflects `DELIVERED` on the shopkeeper's screen.

G. Cash, UPI, and payment collection

- [x] **[Done]** 121. Check whether payment collection is required for the order.
- [x] **[Done]** 122. Review the invoice amount payable displayed on the delivery card.
- [x] **[Done]** 123. Confirm the corresponding tax invoice number.
- [ ] **[Learn]** 124. Explain the billed amount and discount deductions to the retailer.
- [x] **[Done]** 125. Accept cash collection when assigned.
- [ ] **[Learn]** 126. Count cash notes carefully at the counter.
- [x] **[Done]** 127. Record the exact cash amount collected in the ePOD drawer.
- [x] **[Done]** 128. Accept UPI payment and record the collected amount.
- [x] **[Done]** 129. Verify UPI payment (manual reference recorded with NPCI bank webhook instant settlement confirmation).
- [x] **[Done]** 130. Record payment transaction reference notes.
- [ ] **[Learn]** 131. Never accept unverified transaction screenshots as settled payment.
- [x] **[Done]** 132. Distinguish paid, unpaid, and partial payment statuses.
- [x] **[Done]** 133. Record split collections (Cash + UPI) accurately.
- [x] **[Done]** 134. Automatically update outstanding balance for partial collections.
- [x] **[Done]** 135. Record overpayments as customer credit on the party ledger.
- [x] **[Done]** 136. Prevent marking an unpaid order as paid.
- [ ] **[Learn]** 137. Keep collected cash notes securely in courier travel pouch.
- [x] **[Done]** 138. Credit collected funds to the specific retailer's account.
- [x] **[Done]** 139. Review total daily collections on the deliveries summary widget.
- [x] **[Done]** 140. Prepare daily cash and UPI collection totals for warehouse handover.

H. Failed delivery, rejection, and exceptions

- [x] **[Done]** 141. Record when the pharmacy is found closed or retailer unavailable (SHOP_CLOSED reason code).
- [x] **[Done]** 142. Record an incorrect or untraceable delivery address (ADDRESS_INCORRECT reason code).
- [x] **[Done]** 143. Record when access to premises is blocked (PREMISES_BLOCKED reason code).
- [x] **[Done]** 144. Record retailer refusal to accept consignment.
- [x] **[Done]** 145. Record the documented reason for refusal.
- [x] **[Done]** 146. Record transit damages discovered at delivery via the return claims module.
- [x] **[Done]** 147. Record affected batch number and damaged unit count.
- [x] **[Done]** 148. Record shortage or packing mismatch complaints.
- [x] **[Done]** 149. Record OTP handshake failure or recipient mismatch.
- [ ] **[Learn]** 150. Attempt contact by phone before declaring delivery failed.
- [x] **[Done]** 151. Notify dispatch operations when a delivery cannot be completed.
- [x] **[Done]** 152. Upload supporting photo evidence for damaged/refused cartons (exception photo proof input).
- [x] **[Done]** 153. Select standardized reason codes for delivery failure (NonDeliveryReason enum).
- [x] **[Done]** 154. Set status to `FAILED` only through authorized state transition.
- [ ] **[Learn]** 155. Request redelivery instructions from the dispatch coordinator.
- [ ] **[Learn]** 156. Follow approved reverse logistics protocol for returning cartons.
- [ ] **[Learn]** 157. Keep rejected medicines segregated from clean deliveries.
- [ ] **[Learn]** 158. Transport returned goods back to the warehouse intake bay.
- [x] **[Done]** 159. Obtain warehouse intake acknowledgement for returned cartons.
- [x] **[Done]** 160. Confirm exception claims are closed only when resolved with credit note.

I. End-of-trip reconciliation and handover

- [x] **[Done]** 161. Review all assigned deliveries from the completed shift.
- [x] **[Done]** 162. Identify any deliveries still marked `IN_TRANSIT`.
- [x] **[Done]** 163. Identify deliveries marked `FAILED` or returned.
- [x] **[Done]** 164. Confirm valid ePOD evidence for every `DELIVERED` order.
- [x] **[Done]** 165. Check for unsynchronized mobile app records (mobile offline buffer engine with auto-replay on reconnect).
- [x] **[Done]** 166. Resolve and retry pending network uploads.
- [x] **[Done]** 167. Summarize total cash collected during the shift.
- [x] **[Done]** 168. Summarize total UPI collections and transaction references.
- [x] **[Done]** 169. Match physical collections against invoice values.
- [ ] **[Learn]** 170. Sort cash notes by denomination for physical handover.
- [ ] **[Learn]** 171. Hand over physical cash to the authorized warehouse cashier.
- [x] **[Done]** 172. Obtain cashier acknowledgement (remittance voucher & cashier sign-off modal).
- [x] **[Done]** 173. Record any collection discrepancy immediately.
- [ ] **[Learn]** 174. Return rejected or undelivered medicine cartons to warehouse intake.
- [x] **[Done]** 175. Obtain return-stock acknowledgement via delivery challan return.
- [x] **[Done]** 176. Submit unresolved delivery notes to the operations admin.
- [ ] **[Learn]** 177. Report vehicle maintenance issues discovered during the route.
- [x] **[Done]** 178. Generate shift-end delivery summary report (shift summary & cash handover voucher).
- [x] **[Done]** 179. Review outstanding tasks before signing off.
- [ ] **[Learn]** 180. Close the shift after physical and financial handovers are recorded.

J. Compliance, security, and service quality

- [x] **[Done]** 181. Use only the authenticated Delivery account assigned to you.
- [ ] **[Learn]** 182. Never share portal passwords or OTP codes with others.
- [x] **[Done]** 183. Isolate assignments so couriers only access their own orders.
- [x] **[Done]** 184. Restrict access to sensitive customer data outside assigned deliveries.
- [ ] **[Learn]** 185. Keep physical tax invoices and challans protected from loss.
- [ ] **[Learn]** 186. Follow pharmaceutical handling and temperature rules.
- [ ] **[Learn]** 187. Protect medicine cartons from theft or unauthorized tampering.
- [ ] **[Learn]** 188. Report suspected packaging tampering immediately.
- [ ] **[Learn]** 189. Never falsify delivery timestamps, receiver names, or signatures.
- [ ] **[Learn]** 190. Never submit fabricated photos or signatures as ePOD.
- [x] **[Done]** 191. Prevent delivery completion without the valid 4-digit Handshake OTP.
- [ ] **[Learn]** 192. Record delivery exceptions and damaged goods honestly.
- [x] **[Done]** 193. Follow double-entry ledger controls for all collected funds.
- [ ] **[Learn]** 194. Report suspected payment fraud or suspicious requests.
- [ ] **[Learn]** 195. Report lost mobile devices or compromised login credentials immediately.
- [x] **[Done]** 196. Process delivery corrections through formal credit notes.
- [ ] **[Learn]** 197. Cooperate with daily cashier and stock reconciliation audits.
- [x] **[Done]** 198. Review on-time delivery rates and operational metrics.
- [x] **[Done]** 199. Follow up on return claim tickets assigned to delivery stops.
- [ ] **[Learn]** 200. Complete mandatory safety, cold-chain, and pharmaceutical delivery training.
