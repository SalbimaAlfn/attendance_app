const express = require("express");
const path = require("path");
const multer = require("multer");
const XLSX = require("xlsx");
const QRCode = require("qrcode");
const fs = require("fs");


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

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "pages", "index.html"));
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

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000")
});