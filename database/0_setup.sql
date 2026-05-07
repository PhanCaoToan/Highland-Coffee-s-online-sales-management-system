-- =====================================================
-- HIGHLANDS COFFEE - CÀI ĐẶT SQL SERVER
-- Chạy file này TRƯỚC TIÊN trong SSMS
-- Server: CAOTOAN, Windows Authentication
-- =====================================================

-- 1. Bật Mixed Mode Authentication & tạo login SA
-- (Chạy khi đang kết nối bằng Windows Authentication)

-- Bật Mixed Mode Authentication
EXEC xp_instance_regwrite 
    N'HKEY_LOCAL_MACHINE', 
    N'Software\Microsoft\MSSQLServer\MSSQLServer', 
    N'LoginMode', 
    REG_DWORD, 
    2;

PRINT N'✅ Đã bật Mixed Mode Authentication (Windows + SQL Server)';
GO

-- Bật tài khoản SA
ALTER LOGIN [sa] ENABLE;
GO

-- Đặt mật khẩu cho SA
ALTER LOGIN [sa] WITH PASSWORD = '123456';
GO

-- Kiểm tra SA
ALTER LOGIN [sa] WITH CHECK_POLICY = OFF;
GO

PRINT N'✅ Đã kích hoạt tài khoản SA với mật khẩu: 123456';
GO

-- 2. Tạo Database
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'HighlandsCoffeeDB')
BEGIN
    CREATE DATABASE HighlandsCoffeeDB;
    PRINT N'✅ Đã tạo database HighlandsCoffeeDB';
END
ELSE
    PRINT N'⚠️ Database HighlandsCoffeeDB đã tồn tại';
GO

PRINT N'';
PRINT N'==========================================';
PRINT N'  CÀI ĐẶT HOÀN TẤT!';
PRINT N'==========================================';
PRINT N'';
PRINT N'📋 Các bước tiếp theo:';
PRINT N'  1. Khởi động lại SQL Server Service';
PRINT N'     (Mở Services -> SQL Server (MSSQLSERVER) -> Restart)';
PRINT N'  2. Bật TCP/IP trong SQL Server Configuration Manager';
PRINT N'  3. Chạy file schema.sql';
PRINT N'  4. Chạy file seed_data.sql';
PRINT N'  5. Chạy file stored_procedures.sql';
PRINT N'';
PRINT N'🔑 Thông tin đăng nhập SQL:';
PRINT N'   User: sa';
PRINT N'   Password: 123456';
GO
