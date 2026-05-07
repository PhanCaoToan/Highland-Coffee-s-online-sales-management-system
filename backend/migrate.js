// Migration script - Update order status constraint
const { getPool, sql } = require('./config/db');

async function runMigration() {
  try {
    const pool = await getPool();
    console.log('Connected to database');

    // 1. Try to drop old constraint (may already be dropped)
    console.log('1. Dropping old constraint (if exists)...');
    try {
      await pool.request().query(`
        IF EXISTS (SELECT * FROM sys.check_constraints WHERE name = 'CK_DonHang_TrangThai')
          ALTER TABLE DonHang DROP CONSTRAINT CK_DonHang_TrangThai
      `);
      console.log('   Done');
    } catch(e) {
      console.log('   Constraint already dropped or not found');
    }

    // 2. Check current data
    console.log('\n2. Current statuses:');
    const before = await pool.request().query(`
      SELECT TrangThaiDon, COUNT(*) as cnt FROM DonHang GROUP BY TrangThaiDon
    `);
    before.recordset.forEach(r => console.log(`   "${r.TrangThaiDon?.trim()}": ${r.cnt}`));

    // 3. Update data
    console.log('\n3. Updating statuses...');
    const r1 = await pool.request().query(
      "UPDATE DonHang SET TrangThaiDon = N'\u0110ang x\u1eed l\u00fd' WHERE TrangThaiDon = N'\u0110ang pha ch\u1ebf'"
    );
    console.log(`   'Đang pha chế' → 'Đang xử lý': ${r1.rowsAffected[0]} rows`);

    const r2 = await pool.request().query(
      "UPDATE DonHang SET TrangThaiDon = N'\u0110\u00e3 giao' WHERE TrangThaiDon = N'Ho\u00e0n th\u00e0nh'"
    );
    console.log(`   'Hoàn thành' → 'Đã giao': ${r2.rowsAffected[0]} rows`);

    // 4. Verify data before adding constraint
    console.log('\n4. Statuses after update:');
    const after = await pool.request().query(`
      SELECT TrangThaiDon, COUNT(*) as cnt FROM DonHang GROUP BY TrangThaiDon
    `);
    after.recordset.forEach(r => console.log(`   "${r.TrangThaiDon?.trim()}": ${r.cnt}`));

    // 5. Add new constraint
    console.log('\n5. Adding new constraint...');
    await pool.request().query(`
      ALTER TABLE DonHang ADD CONSTRAINT CK_DonHang_TrangThai CHECK (TrangThaiDon IN (
        N'Ch\u1edd x\u00e1c nh\u1eadn', N'\u0110\u00e3 x\u00e1c nh\u1eadn', N'\u0110ang x\u1eed l\u00fd',
        N'\u0110ang giao', N'\u0110\u00e3 giao', N'\u0110\u00e3 h\u1ee7y'
      ))
    `);
    console.log('   ✅ New constraint added!');

    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('   New flow: Chờ xác nhận → Đã xác nhận → Đang xử lý → Đang giao → Đã giao');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

runMigration();
