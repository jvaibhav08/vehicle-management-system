#Authentication

    POST    /api/auth/login
    POST    /api/auth/forgot-password
    POST    /api/auth/reset-password
    POST    /api/auth/change-password
    POST    /api/auth/logout

#Vehicles

    GET     /api/vehicles
    GET     /api/vehicles/:id
    POST    /api/vehicles
    PUT     /api/vehicles/:id
    DELETE  /api/vehicles/:id

#Insurance

    GET     /api/insurance
    GET     /api/insurance/:id
    POST    /api/insurance
    PUT     /api/insurance/:id
    DELETE  /api/insurance/:id

#PUC

    GET     /api/puc
    GET     /api/puc/:id
    POST    /api/puc
    PUT     /api/puc/:id
    DELETE  /api/puc/:id

#Dashboard

    GET     /api/dashboard

#Reports

    GET /api/reports/vehicles
    GET /api/reports/insurance
    GET /api/reports/puc

    GET /api/reports/export/excel
    GET /api/reports/export/pdf


vehicle-management-system/
│
├── client/
├── server/
├── docs/
│   ├── requirements.md
│   ├── database-design.md
│   └── api-design.md
│
└── README.md