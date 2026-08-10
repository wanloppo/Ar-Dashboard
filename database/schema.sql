-- Run this script manually on the arvl database. It does not modify transaction tables.
IF OBJECT_ID('dbo.UserInfo', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.UserInfo (
    user_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_UserInfo PRIMARY KEY,
    username NVARCHAR(100) NOT NULL CONSTRAINT UQ_UserInfo_Username UNIQUE,
    full_name NVARCHAR(200) NOT NULL,
    email NVARCHAR(250) NULL,
    role NVARCHAR(50) NOT NULL CONSTRAINT DF_UserInfo_Role DEFAULT ('user'),
    password_hash NVARCHAR(255) NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_UserInfo_IsActive DEFAULT (1),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_UserInfo_CreatedAt DEFAULT (SYSUTCDATETIME())
  );
END;
GO

IF OBJECT_ID('dbo.ScreenInfo', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.ScreenInfo (
    screen_id INT IDENTITY(1,1) NOT NULL CONSTRAINT PK_ScreenInfo PRIMARY KEY,
    screen_eng_name NVARCHAR(200) NOT NULL CONSTRAINT UQ_ScreenInfo_EngName UNIQUE,
    screen_tha_name NVARCHAR(200) NOT NULL,
    insert_active BIT NOT NULL CONSTRAINT DF_ScreenInfo_Insert DEFAULT (0),
    update_active BIT NOT NULL CONSTRAINT DF_ScreenInfo_Update DEFAULT (0),
    delete_active BIT NOT NULL CONSTRAINT DF_ScreenInfo_Delete DEFAULT (0),
    query_active BIT NOT NULL CONSTRAINT DF_ScreenInfo_Query DEFAULT (1),
    report_active BIT NOT NULL CONSTRAINT DF_ScreenInfo_Report DEFAULT (0),
    process_active BIT NOT NULL CONSTRAINT DF_ScreenInfo_Process DEFAULT (0),
    created_at DATETIME2 NOT NULL CONSTRAINT DF_ScreenInfo_CreatedAt DEFAULT (SYSUTCDATETIME())
  );
END;
GO

IF OBJECT_ID('dbo.AccessScreenInfo', 'U') IS NULL
BEGIN
  CREATE TABLE dbo.AccessScreenInfo (
    user_id INT NOT NULL,
    screen_id INT NOT NULL,
    insert_active BIT NOT NULL,
    update_active BIT NOT NULL,
    delete_active BIT NOT NULL,
    query_active BIT NOT NULL,
    report_active BIT NOT NULL,
    process_active BIT NOT NULL,
    created_at DATETIME2 NOT NULL CONSTRAINT DF_AccessScreenInfo_CreatedAt DEFAULT (SYSUTCDATETIME()),
    updated_at DATETIME2 NOT NULL CONSTRAINT DF_AccessScreenInfo_UpdatedAt DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT PK_AccessScreenInfo PRIMARY KEY (user_id, screen_id),
    CONSTRAINT FK_AccessScreenInfo_User FOREIGN KEY (user_id) REFERENCES dbo.UserInfo(user_id) ON DELETE CASCADE,
    CONSTRAINT FK_AccessScreenInfo_Screen FOREIGN KEY (screen_id) REFERENCES dbo.ScreenInfo(screen_id) ON DELETE CASCADE
  );
END;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ScreenInfo WHERE screen_eng_name='creditinvoice_dashboard')
  INSERT INTO dbo.ScreenInfo (screen_eng_name,screen_tha_name,insert_active,update_active,delete_active,query_active,report_active,process_active)
  VALUES ('creditinvoice_dashboard',N'ภาพรวม CreditInvoice',0,0,0,1,0,0);
GO

IF NOT EXISTS (SELECT 1 FROM dbo.ScreenInfo WHERE screen_eng_name='creditinvoice_daily')
  INSERT INTO dbo.ScreenInfo (screen_eng_name,screen_tha_name,insert_active,update_active,delete_active,query_active,report_active,process_active)
  VALUES ('creditinvoice_daily',N'รายละเอียดรายวัน',0,0,0,1,0,0);
GO
