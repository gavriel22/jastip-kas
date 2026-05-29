
import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  const sql = neon(process.env.DATABASE_URL);

  try {
    // Ensure table exists
    await sql`
      CREATE TABLE IF NOT EXISTS transaksi (
        id SERIAL PRIMARY KEY,
        tanggal VARCHAR(10) NOT NULL,
        event VARCHAR(255) NOT NULL,
        nama_transaksi VARCHAR(255) NOT NULL,
        kategori VARCHAR(255) NOT NULL,
        jenis VARCHAR(10) NOT NULL,
        nominal NUMERIC NOT NULL,
        keterangan TEXT
      )
    `;

    // HTTP GET - Fetch all transactions
    if (req.method === 'GET') {
      const rows = await sql`SELECT * FROM transaksi ORDER BY tanggal DESC, id DESC`;
      const transactions = rows.map(r => ({
        id: r.id.toString(),
        date: r.tanggal,
        event: r.event,
        name: r.nama_transaksi,
        category: r.kategori,
        type: r.jenis,
        amount: Number(r.nominal),
        description: r.keterangan || ''
      }));
      return res.status(200).json(transactions);
    }

    // HTTP POST - Add a new transaction (Single or Bulk)
    if (req.method === 'POST') {
      if (Array.isArray(req.body)) {
        // Bulk Insert validation
        for (const item of req.body) {
          const { date, event, name, category, type, amount } = item;
          if (!date || !event || !name || !category || !type || amount === undefined) {
            return res.status(400).json({ error: 'Data tidak lengkap untuk salah satu transaksi dalam batch' });
          }
        }

        // Execute parallel inserts using Promise.all
        const insertPromises = req.body.map(async (item) => {
          const { date, event, name, category, type, amount, description } = item;
          const result = await sql`
            INSERT INTO transaksi (tanggal, event, nama_transaksi, kategori, jenis, nominal, keterangan)
            VALUES (${date}, ${event}, ${name}, ${category}, ${type}, ${amount}, ${description || ''})
            RETURNING *
          `;
          return {
            id: result[0].id.toString(),
            date: result[0].tanggal,
            event: result[0].event,
            name: result[0].nama_transaksi,
            category: result[0].kategori,
            type: result[0].jenis,
            amount: Number(result[0].nominal),
            description: result[0].keterangan || ''
          };
        });

        const createdItems = await Promise.all(insertPromises);
        return res.status(201).json(createdItems);
      } else {
        // Single Insert
        const { date, event, name, category, type, amount, description } = req.body;
        if (!date || !event || !name || !category || !type || amount === undefined) {
          return res.status(400).json({ error: 'Data tidak lengkap untuk menambahkan transaksi' });
        }
        const result = await sql`
          INSERT INTO transaksi (tanggal, event, nama_transaksi, kategori, jenis, nominal, keterangan)
          VALUES (${date}, ${event}, ${name}, ${category}, ${type}, ${amount}, ${description || ''})
          RETURNING *
        `;
        const created = {
          id: result[0].id.toString(),
          date: result[0].tanggal,
          event: result[0].event,
          name: result[0].nama_transaksi,
          category: result[0].kategori,
          type: result[0].jenis,
          amount: Number(result[0].nominal),
          description: result[0].keterangan || ''
        };
        return res.status(201).json(created);
      }
    }

    // HTTP PUT - Update an existing transaction
    if (req.method === 'PUT') {
      const { id, date, event, name, category, type, amount, description } = req.body;
      if (!id || !date || !event || !name || !category || !type || amount === undefined) {
        return res.status(400).json({ error: 'Data tidak lengkap untuk memperbarui transaksi' });
      }
      const result = await sql`
        UPDATE transaksi
        SET tanggal = ${date},
            event = ${event},
            nama_transaksi = ${name},
            kategori = ${category},
            jenis = ${type},
            nominal = ${amount},
            keterangan = ${description || ''}
        WHERE id = ${Number(id)}
        RETURNING *
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }
      const updated = {
        id: result[0].id.toString(),
        date: result[0].tanggal,
        event: result[0].event,
        name: result[0].nama_transaksi,
        category: result[0].kategori,
        type: result[0].jenis,
        amount: Number(result[0].nominal),
        description: result[0].keterangan || ''
      };
      return res.status(200).json(updated);
    }

    // HTTP DELETE - Remove a transaction
    if (req.method === 'DELETE') {
      const id = req.query.id || req.body?.id;
      if (!id) {
        return res.status(400).json({ error: 'ID transaksi diperlukan untuk menghapus data' });
      }
      const result = await sql`
        DELETE FROM transaksi
        WHERE id = ${Number(id)}
        RETURNING *
      `;
      if (result.length === 0) {
        return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
      }
      return res.status(200).json({ success: true, message: 'Transaksi berhasil dihapus' });
    }

    // HTTP 405 Method Not Allowed
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error('Database serverless error:', error);
    return res.status(500).json({ error: 'Terjadi kesalahan internal database', details: error.message });
  }
}
