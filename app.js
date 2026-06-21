const express = require("express");
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");
const QRCode = require("qrcode");
const fs = require("fs");
const cron = require("node-cron");


const restoreUpload =
    multer({
        dest: "uploads/"
    });

const upload = multer ({
    dest : "uploads/"
});

const app = express();

const sqlite3 =
    require("sqlite3").verbose();

const db =
    new sqlite3.Database(
        "./database/db_attendance.db",
        (err) => {

            if (err) {
                console.log(err.message);
            } else {
    console.log("Database Connected");

function createBackup() {

    const date =
    new Date()
        .toISOString()
        .replace(/[:.]/g, "-");

    const source =
        "./database/db_attendance.db";

    const destination =
        `./backupDB/backup_${date}.db`;

    fs.copyFile(
        source,
        destination,
        (err) => {

            if (err) {

                console.log(
                    "Backup Error:",
                    err
                );

            } else {

                console.log(
                    "Backup Created:",
                    destination
                );

            }

        }
    );

}

cron.schedule(
    "0 0 * * 0",
    () => {

        createBackup();

    }
);


    db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (err, rows) => {

            if (err) {
                console.log(err);
            } else {
                console.log("Tables Found:");
                console.table(rows);
            }

        }
    );
}

        }
    );

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

app.post(
    "/api/restore-database",
    restoreUpload.single(
        "backup"
    ),
    (req, res) => {

        const uploadedFile =
            req.file.path;

        const databaseFile =
            "./database/db_attendance.db";

        fs.copyFile(
            uploadedFile,
            databaseFile,
            (err) => {

                if (err) {

                    return res.status(500).json({
                        error: err.message
                    });

                }

                fs.unlinkSync(
                    uploadedFile
                );

                res.json({
                    message:
                        "Database restored successfully. Restart server."
                });

            }
        );

    }
);

app.get(
    "/restore",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "public",
                "restore.html"
            )
        );

    }
);

app.get(
    "/backup-database",
    (req, res) => {

        const databaseFile =
            path.join(
                __dirname,
                "database",
                "db_attendance.db"
            );

        const fileName =
            `db_attendance_backup_${new Date()
                .toISOString()
                .split("T")[0]}.db`;

        res.download(
            databaseFile,
            fileName
        );

    }
);

app.post("/students", (req, res) => {

    const {
        student_code,
        name,
        class_name
    } = req.body;

    db.run(
        `
        INSERT INTO students
        (
            student_code,
            name,
            class_name
        )
        VALUES (?, ?, ?)
        `,
        [
            student_code,
            name,
            class_name
        ],
        (err) => {

            if (err) {
                return res.status(500).json({
                    message: err.message
                });
            }

            res.json({
                message:
                    "Student added successfully"
            });

        }
    );

});

app.get("/scanner", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "scanner.html"
        )
    );

});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "dashboard.html"));
});
app.get("/students", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "students.html"));
});

app.get("/add-student", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "add-student.html"
        )
    );
});

app.get("/import-student", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "import-student.html"
        )
    );
});

app.post(
    "/import-student",
    upload.single("excelFile"),
    (req, res) => {

        const workbook =
            XLSX.readFile(req.file.path);

        const sheet =
            workbook.Sheets[
                workbook.SheetNames[0]
            ];

        const students =
            XLSX.utils.sheet_to_json(sheet);

        students.forEach((student) => {

            db.run(
                `
                INSERT INTO students
                (
                    student_code,
                    name,
                    class_name
                )
                VALUES (?, ?, ?)
                `,
                [
                    student.student_code,
                    student.name,
                    student.class_name
                ]
            );

        });

        res.send(
            "Students imported successfully"
        );

    }
);

app.get("/edit-student/:id", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "edit-student.html"
        )
    );

});
app.get("/api/students", (req, res) => {

    const search =
        req.query.search || "";

    db.all(
        `
        SELECT *
        FROM students
        WHERE name LIKE ?
        ORDER BY name ASC
        `,
        [`%${search}%`],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);

        }
    );

});

app.get("/api/students/:id", (req, res) => {

    const id = req.params.id;

    db.get(
        "SELECT * FROM students WHERE id = ?",
        [id],
        (err, row) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(row);

        }
    );

});

app.put("/api/students/:id", (req, res) => {

    const id = req.params.id;

    const {
        name,
        class_name
    } = req.body;

    db.run(
        `
        UPDATE students
        SET
            name = ?,
            class_name = ?
        WHERE id = ?
        `,
        [
            name,
            class_name,
            id
        ],
        function(err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message:
                    "Student updated successfully"
            });

        }
    );

});

app.delete("/api/students/:id", (req, res) => {

    const id = req.params.id;

    db.run(
        "DELETE FROM students WHERE id = ?",
        [id],
        function(err) {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                message: "Student deleted successfully"
            });

        }
    );

});

app.post("/api/students/:id/generate-qr", (req, res) => {

    const id = req.params.id;

    db.get(
        "SELECT * FROM students WHERE id = ?",
        [id],
        async (err, student) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!student) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            const qrFolder =
                path.join(
                    __dirname,
                    "public",
                    "qr"
                );

            if (!fs.existsSync(qrFolder)) {
                fs.mkdirSync(qrFolder);
            }

            const qrPath =
                `qr/${student.student_code}.png`;

            const fullPath =
                path.join(
                    __dirname,
                    "public",
                    qrPath
                );

            try {

                await QRCode.toFile(
                    fullPath,
                    student.student_code
                );

                db.run(
                    `
                    UPDATE students
                    SET qr_code = ?
                    WHERE id = ?
                    `,
                    [
                        qrPath,
                        id
                    ],
                    (err) => {

                        if (err) {
                            return res.status(500).json({
                                error: err.message
                            });
                        }

                        res.json({
                            message:
                                "QR generated successfully",
                            qr_code:
                                qrPath
                        });

                    }
                );

            } catch (error) {

                res.status(500).json({
                    error: error.message
                });

            }

        }
    );

});

app.get("/attendance", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "attendance.html"
        )
    );

});

app.post("/api/attendance/scan", (req, res) => {

    const { student_code } = req.body;

    db.get(
        `
        SELECT *
        FROM students
        WHERE student_code = ?
        `,
        [student_code],
        (err, student) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            if (!student) {
                return res.status(404).json({
                    error: "Student not found"
                });
            }

            const today =
                new Date()
                .toISOString()
                .split("T")[0];

            db.get(
                `
                SELECT *
                FROM attendance
                WHERE student_id = ?
                AND attendance_date = ?
                `,
                [
                    student.id,
                    today
                ],
                (err, attendance) => {
if (attendance) {

    return db.all(
        `
        SELECT
            item_types.item_name,
            student_items.item_label,
            student_items.status
        FROM student_items

        JOIN item_types
        ON student_items.item_type_id =
        item_types.id

        WHERE student_items.student_id = ?
        `,
        [student.id],
        (err, items) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            return res.json({
                alreadyPresent: true,
                student,
                items
            });

        }
    );

}

                    const now =
                        new Date();

                    const time =
                        now
                        .toLocaleTimeString(
                            "en-GB"
                        );

                    db.run(
                        `
                        INSERT INTO attendance
                        (
                            student_id,
                            attendance_date,
                            attendance_time
                        )
                        VALUES (?, ?, ?)
                        `,
                        [
                            student.id,
                            today,
                            time
                        ],
                        function(err) {

                            if (err) {
                                return res.status(500).json({
                                    error: err.message
                                });
                            }

        db.all(
    `
    SELECT
        item_types.item_name,
        student_items.item_label,
        student_items.status
    FROM student_items

    JOIN item_types
    ON student_items.item_type_id =
    item_types.id

    WHERE student_items.student_id = ?
    `,
    [student.id],
    (err, items) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            success: true,
            student,
            items
        });

    }
);

                        }
                    );

                }
            );

        }
    );

});

app.get("/dashboard", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "dashboard.html"
        )
    );

});

app.get("/api/dashboard", (req, res) => {

    const today =
        new Date()
        .toISOString()
        .split("T")[0];

    db.get(
        `
        SELECT COUNT(*) AS totalStudents
        FROM students
        `,
        [],
        (err, studentsResult) => {

            db.get(
                `
                SELECT COUNT(*) AS presentToday
                FROM attendance
                WHERE attendance_date = ?
                `,
                [today],
                (err, attendanceResult) => {

                    db.get(
                        `
                        SELECT COUNT(*) AS lostItems
                        FROM student_items
                        WHERE status = 'Lost'
                        `,
                        [],
                        (err, lostResult) => {

                            db.get(
                                `
                                SELECT COUNT(*) AS damagedItems
                                FROM student_items
                                WHERE status = 'Damaged'
                                `,
                                [],
                                (err, damagedResult) => {

                                    res.json({

                                        totalStudents:
                                            studentsResult.totalStudents,

                                        presentToday:
                                            attendanceResult.presentToday,

                                        absentToday:
                                            studentsResult.totalStudents -
                                            attendanceResult.presentToday,

                                        lostItems:
                                            lostResult.lostItems,

                                        damagedItems:
                                            damagedResult.damagedItems

                                    });

                                }
                            );

                        }
                    );

                }
            );

        }
    );

});

app.get("/api/attendance", (req, res) => {

    const date =
        req.query.date;

    let sql = `
        SELECT
            attendance.id,
            attendance.attendance_date,
            attendance.attendance_time,
            attendance.status,
            students.name,
            students.class_name
        FROM attendance
        JOIN students
        ON attendance.student_id = students.id
    `;

    let params = [];

    if (date) {

        sql += `
            WHERE attendance.attendance_date = ?
        `;

        params.push(date);

    }

    sql += `
        ORDER BY attendance.id DESC
    `;

    db.all(
        sql,
        params,
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json(rows);

        }
    );

});

app.get("/export-student-items", (req, res) => {

    db.all(
        `
        SELECT
            students.student_code,
            students.name,
            students.class_name,
            item_types.item_name,
            student_items.item_label,
            student_items.status

        FROM student_items

        JOIN students
        ON student_items.student_id =
           students.id

        JOIN item_types
        ON student_items.item_type_id =
           item_types.id

        ORDER BY students.name ASC
        `,
        [],
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const workbook =
                XLSX.utils.book_new();

            const worksheet =
                XLSX.utils.json_to_sheet(rows);

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Student Items"
            );

            const buffer =
                XLSX.write(
                    workbook,
                    {
                        type: "buffer",
                        bookType: "xlsx"
                    }
                );

            res.setHeader(
                "Content-Disposition",
                "attachment; filename=student-items.xlsx"
            );

            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );

            res.send(buffer);

        }
    );

});

app.delete("/api/items/:id", (req, res) => {

    const id =
        req.params.id;

    db.run(
        `
        DELETE FROM item_types
        WHERE id = ?
        `,
        [id],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                message:
                    "Item type deleted successfully"
            });

        }
    );

});

app.put("/api/items/:id", (req, res) => {

    const id =
        req.params.id;

    const {
        item_name
    } = req.body;

    db.run(
        `
        UPDATE item_types
        SET item_name = ?
        WHERE id = ?
        `,
        [
            item_name,
            id
        ],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                message:
                    "Item type updated successfully"
            });

        }
    );

});

app.get("/api/dashboard", (req, res) => {

    const today =
        new Date()
        .toISOString()
        .split("T")[0];

    db.get(
        "SELECT COUNT(*) AS totalStudents FROM students",
        [],
        (err, studentResult) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            db.get(
                `
                SELECT COUNT(*) AS presentToday
                FROM attendance
                WHERE attendance_date = ?
                `,
                [today],
                (err, attendanceResult) => {

                    if (err) {
                        return res.status(500).json({
                            error: err.message
                        });
                    }

                    const totalStudents =
                        studentResult.totalStudents;

                    const presentToday =
                        attendanceResult.presentToday;

                    const absentToday =
                        totalStudents -
                        presentToday;

                    res.json({
                        totalStudents,
                        presentToday,
                        absentToday
                    });

                }
            );

        }
    );

});

app.get("/api/items", (req, res) => {

    db.all(
        `
        SELECT *
        FROM item_types
        ORDER BY item_name ASC
        `,
        [],
        (err, rows) => {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json(rows);

        }
    );

});

app.post("/api/items", (req, res) => {

    const item_name =
    req.body.item_name.trim();

const description =
    req.body.description.trim();

    db.run(
        `
        INSERT INTO item_types
        (
            item_name,
            description
        )
        VALUES (?, ?)
        `,
        [
            item_name,
            description
        ],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                message:
                    "Item added successfully"
            });

        }
    );

});

app.get("/student-items/:id", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "student-items.html"
        )
    );

});

app.get("/items", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "pages",
            "items.html"
        )
    );

});

app.post("/api/student-items", (req, res) => {

    const {
        student_id,
        item_type_id,
        item_label
    } = req.body;

    db.run(
        `
        INSERT INTO student_items
        (
            student_id,
            item_type_id,
            item_label
        )
        VALUES (?, ?, ?)
        `,
        [
            student_id,
            item_type_id,
            item_label
        ],
        function(err) {

            if (err) {

                return res.status(500).json({
                    error: err.message
                });

            }

            res.json({
                message:
                    "Item assigned successfully"
            });

        }
    );

});

app.get(
    "/api/student-items/:studentId",
    (req, res) => {

        const studentId =
            req.params.studentId;

        db.all(
            `
            SELECT
                student_items.id,
                item_types.item_name,
                student_items.item_label,
                student_items.status
            FROM student_items

            JOIN item_types
            ON student_items.item_type_id =
            item_types.id

            WHERE student_items.student_id = ?

            ORDER BY student_items.id DESC
            `,
            [studentId],
            (err, rows) => {

                if (err) {

                    return res.status(500).json({
                        error: err.message
                    });

                }

                res.json(rows);

            }
        );

    }
);

app.get("/api/attendance/export", (req, res) => {

    const date = req.query.date;

let sql = `
    SELECT
        attendance.attendance_date,
        attendance.attendance_time,
        students.student_code,
        students.name,
        students.class_name,
        attendance.status
    FROM attendance
    JOIN students
    ON attendance.student_id = students.id
`;

let params = [];

if (date) {

    sql += `
        WHERE attendance.attendance_date = ?
    `;

    params.push(date);

}

sql += `
    ORDER BY attendance.id DESC
`;

db.all(
    sql,
    params,
        (err, rows) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            const workbook =
                XLSX.utils.book_new();

            const worksheet =
                XLSX.utils.json_to_sheet(rows);

            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Attendance"
            );

            const filePath =
                path.join(
                    __dirname,
                    "attendance.xlsx"
                );

            XLSX.writeFile(
                workbook,
                filePath
            );

            const fileName =
    date
    ? `attendance_${date}.xlsx`
    : "attendance.xlsx";

res.download(
    filePath,
    fileName
);

        }
    );

});

app.post("/api/student-items", (req, res) => {
    console.log("POST route reached");
    res.json({ message: "POST works" });
});

app.put(
    "/api/student-items/:id",
    (req, res) => {

        const id =
            req.params.id;

        const {
            status
        } = req.body;

        db.run(
            `
            UPDATE student_items
            SET status = ?
            WHERE id = ?
            `,
            [
                status,
                id
            ],
            function(err) {

                if (err) {

                    return res.status(500).json({
                        error: err.message
                    });

                }

                res.json({
                    message:
                        "Status updated"
                });

            }
        );

    }
);

app.get(
    "/login",
    (req, res) => {

        res.sendFile(
            path.join(
                __dirname,
                "pages",
                "login.html"
            )
        );

    }
);

app.post(
    "/api/login",
    (req, res) => {

        const {
            username,
            password
        } = req.body;

        db.get(
            `
            SELECT *
            FROM users
            WHERE username = ?
            AND password = ?
            `,
            [
                username,
                password
            ],
            (err, user) => {

                if (err) {

                    return res.status(500).json({
                        error: err.message
                    });

                }

                if (!user) {

                    return res.json({
                        success: false
                    });

                }

                res.json({
                    success: true
                });

            }
        );

    }
);

app.delete(
    "/api/student-items/:id",
    (req, res) => {

        const id =
            req.params.id;

        db.run(
            `
            DELETE FROM student_items
            WHERE id = ?
            `,
            [id],
            function(err) {

                if (err) {

                    return res.status(500).json({
                        error: err.message
                    });

                }

                res.json({
                    message:
                        "Item deleted successfully"
                });

            }
        );

    }
);
const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});
