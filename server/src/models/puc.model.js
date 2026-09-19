const db = require("../config/db");

let documentColumn;

const getDocumentColumn = async () => {
  if (documentColumn !== undefined) {
    return documentColumn;
  }

  const [rows] = await db.execute(
    "SHOW COLUMNS FROM puc WHERE Field IN ('certificate_file', 'document_path')"
  );

  documentColumn = rows.some((column) => column.Field === "document_path")
    ? "document_path"
    : rows.some((column) => column.Field === "certificate_file")
      ? "certificate_file"
      : null;

  return documentColumn;
};

const hasDocumentPathColumn = async () => Boolean(await getDocumentColumn());

// ======================================================
// GET PUC BY VEHICLE ID
// ======================================================

const getPucByVehicleId = async (vehicleId) => {
  const query = `
    SELECT *
    FROM puc
    WHERE vehicle_id = ?
  `;

  const [rows] = await db.execute(
    query,
    [vehicleId]
  );

  return rows[0];
};

// ======================================================
// GET PUC BY ID
// Includes vehicle information
// ======================================================

const getPucById = async (pucId) => {
  const query = `
    SELECT
      p.*,
      v.vehicle_number,
      v.vehicle_name
    FROM puc p
    INNER JOIN vehicles v
      ON p.vehicle_id = v.id
    WHERE p.id = ?
  `;

  const [rows] = await db.execute(
    query,
    [pucId]
  );

  return rows[0];
};

// ======================================================
// ADD PUC
// ======================================================

const addPuc = async (pucData) => {
  const documentColumnName = await getDocumentColumn();
  const includesDocumentPath = Boolean(documentColumnName);
  const query = `
    INSERT INTO puc (
      vehicle_id,
      certificate_number,
      expiry_date${includesDocumentPath ? `,\n      ${documentColumnName}` : ""}
    )
    VALUES (?, ?, ?${includesDocumentPath ? ", ?" : ""})
  `;

  const values = [
    pucData.vehicle_id,
    pucData.certificate_number,
    pucData.expiry_date,
    ...(includesDocumentPath ? [pucData.document_path || null] : []),
  ];

  const [result] = await db.execute(
    query,
    values
  );

  return result;
};

// ======================================================
// UPDATE PUC BY VEHICLE ID
// ======================================================

const updatePuc = async (
  vehicleId,
  pucData
) => {
  const documentColumnName = await getDocumentColumn();
  const includesDocumentPath = Object.hasOwn(pucData, "document_path") &&
    Boolean(documentColumnName);
  const documentUpdate = includesDocumentPath
    ? `, ${documentColumnName} = ?`
    : "";
  const query = `
    UPDATE puc
    SET
      certificate_number = ?,
      expiry_date = ?${documentUpdate}
    WHERE vehicle_id = ?
  `;

  const values = [
    pucData.certificate_number,
    pucData.expiry_date,
    ...(includesDocumentPath
      ? [pucData.document_path]
      : []),
    vehicleId,
  ];

  const [result] = await db.execute(
    query,
    values
  );

  return result;
};

// ======================================================
// UPDATE PUC BY ID
// ======================================================

const updatePucById = async (
  pucId,
  pucData
) => {
  const documentColumnName = await getDocumentColumn();
  const includesDocumentPath = Object.hasOwn(pucData, "document_path") &&
    Boolean(documentColumnName);
  const documentUpdate = includesDocumentPath
    ? `, ${documentColumnName} = ?`
    : "";
  const query = `
    UPDATE puc
    SET
      certificate_number = ?,
      expiry_date = ?${documentUpdate}
    WHERE id = ?
  `;

  const values = [
    pucData.certificate_number,
    pucData.expiry_date,
    ...(includesDocumentPath
      ? [pucData.document_path]
      : []),
    pucId,
  ];

  const [result] = await db.execute(
    query,
    values
  );

  return result;
};

// ======================================================
// GET ALL PUC
// ======================================================

const getAllPuc = async (userId) => {
  const documentColumnName = await getDocumentColumn();
  const documentPathSelect = documentColumnName
    ? `p.${documentColumnName} AS document_path`
    : "NULL AS document_path";
  const query = `
    SELECT
      v.id AS vehicle_id,
      v.vehicle_number,
      v.vehicle_name,

      p.id AS puc_id,
      p.certificate_number,
      p.expiry_date,
      ${documentPathSelect},
      p.created_at,
      p.updated_at

    FROM vehicles v

    LEFT JOIN puc p
      ON v.id = p.vehicle_id

    WHERE v.user_id = ?
  `;

  const [rows] = await db.execute(
    query,
    [userId]
  );

  return rows;
};

// ======================================================
// EXPORTS
// ======================================================

module.exports = {
  getPucByVehicleId,
  getPucById,
  getDocumentColumn,
  hasDocumentPathColumn,
  addPuc,
  updatePuc,
  updatePucById,
  getAllPuc,
};
