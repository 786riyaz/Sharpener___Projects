SELECT 
    a.student_id,
    s.name,
    SUM(a.status = 'present') AS present_days,
    SUM(a.status = 'absent') AS absent_days,
    COUNT(*) AS total_days,
    CONCAT(
        SUM(a.status = 'present'),
        '/',
        COUNT(*)
    ) AS attendance
FROM attendances a
JOIN students s 
    ON s.id = a.student_id
GROUP BY a.student_id, s.name;