# 🔐 Roles & Permissions (RBAC)

## Role Hierarchy

```
Super Admin
    └── Admin
        ├── Warehouse Staff
        ├── Delivery Boy
        └── Shopkeeper
```

## Permission Matrix

| Permission                      | Super Admin | Admin | Warehouse | Delivery | Shopkeeper |
|--------------------------------|:-----------:|:-----:|:---------:|:--------:|:----------:|
| **Users**                      |             |       |           |          |            |
| Create Admin                   | ✅          | ❌    | ❌        | ❌       | ❌         |
| Create Warehouse Staff         | ✅          | ✅    | ❌        | ❌       | ❌         |
| Create Delivery Boy            | ✅          | ✅    | ❌        | ❌       | ❌         |
| Register Shopkeeper            | ✅          | ✅    | ❌        | ❌       | ❌         |
| Deactivate User                | ✅          | ✅¹   | ❌        | ❌       | ❌         |
| **Inventory**                  |             |       |           |          |            |
| Add/Edit Product               | ✅          | ✅    | ✅        | ❌       | ❌         |
| Add Purchase Entry             | ✅          | ✅    | ✅        | ❌       | ❌         |
| View Stock Levels              | ✅          | ✅    | ✅        | ❌       | ❌         |
| Adjust Stock                   | ✅          | ✅    | ✅        | ❌       | ❌         |
| **Catalog**                    |             |       |           |          |            |
| Browse Products                | ✅          | ✅    | ✅        | ❌       | ✅         |
| View Pricing & Schemes         | ✅          | ✅    | ❌        | ❌       | ✅         |
| **Orders**                     |             |       |           |          |            |
| Place Order                    | ❌          | ❌    | ❌        | ❌       | ✅         |
| View All Orders                | ✅          | ✅    | ✅        | ❌       | ❌         |
| View Own Orders                | ❌          | ❌    | ❌        | ❌       | ✅         |
| Confirm/Reject Order           | ✅          | ✅    | ❌        | ❌       | ❌         |
| Update Order Status (Picking)  | ✅          | ✅    | ✅        | ❌       | ❌         |
| Cancel Order                   | ✅          | ✅    | ❌        | ❌       | ✅²        |
| **Delivery**                   |             |       |           |          |            |
| Assign Delivery Boy            | ✅          | ✅    | ❌        | ❌       | ❌         |
| View Assigned Deliveries       | ❌          | ❌    | ❌        | ✅       | ❌         |
| Update Delivery Status         | ❌          | ❌    | ❌        | ✅       | ❌         |
| Upload Proof of Delivery       | ❌          | ❌    | ❌        | ✅       | ❌         |
| **Invoices**                   |             |       |           |          |            |
| Generate Invoice               | ✅          | ✅    | ❌        | ❌       | ❌         |
| View All Invoices              | ✅          | ✅    | ❌        | ❌       | ❌         |
| View Own Invoices              | ❌          | ❌    | ❌        | ❌       | ✅         |
| Download Invoice PDF           | ✅          | ✅    | ❌        | ❌       | ✅         |
| **Payments**                   |             |       |           |          |            |
| Record Payment                 | ✅          | ✅    | ❌        | ✅³      | ❌         |
| View Payment History           | ✅          | ✅    | ❌        | ❌       | ✅⁴        |
| **Reports**                    |             |       |           |          |            |
| Sales Reports                  | ✅          | ✅    | ❌        | ❌       | ❌         |
| Inventory Reports              | ✅          | ✅    | ✅        | ❌       | ❌         |
| Delivery Reports               | ✅          | ✅    | ❌        | ❌       | ❌         |
| GST Reports                   | ✅          | ✅    | ❌        | ❌       | ❌         |
| **System**                     |             |       |           |          |            |
| System Configuration           | ✅          | ❌    | ❌        | ❌       | ❌         |
| View Audit Logs                | ✅          | ✅    | ❌        | ❌       | ❌         |

### Notes

1. Admin can only deactivate users they created (not other Admins)
2. Shopkeeper can only cancel orders in `PLACED` status (before confirmation)
3. Delivery boy records cash collection at time of delivery
4. Shopkeeper sees only their own payment history
