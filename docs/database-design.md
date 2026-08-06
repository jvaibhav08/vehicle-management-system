Users
│
├── id              ← Primary Key
├── name
├── email           ← Unique
├── phone_number
├── password    
├── role
└── created_at
└── updated_at

Vehicles
│
├── id              ← primary key
├── vehicle_number  ← unique key
├── vehicle_name
├── vehicle_type
├── manufacture_date
├── rc_status
└── created_at
└── updated_at

Insurance
│
├── id                  ← primary key
├── vehicle_id          ← foreign key
├── insurance_type
├── company
├── policy_number
├── expiry_date
└── created_at
└── updated_at

PUC
│
├── id                  ← primary key
├── vehicle_id          ← Foreign Key
├── expiry_date
└── created_at
└── updated_at