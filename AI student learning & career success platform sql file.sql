CREATE DATABASE student_learning_db;
USE student_learning_db; 
SELECT COUNT(*) AS total_students
FROM student_learning_data; 
SELECT *
FROM student_learning_data
LIMIT 5; 
DESCRIBE student_learning_data; 
SELECT *
FROM student_learning_data
LIMIT 10;
SELECT 
    student_id,
    attendance_percentage,
    overall_readiness_score,
    risk_level,
    recommended_skill,
    recommended_topic
FROM student_learning_data
WHERE risk_level = 'High'; 
SELECT 
    student_id,
    attendance_percentage,
    overall_readiness_score,
    risk_level,
    placement_ready,
    recommended_skill,
    recommended_topic
FROM
    student_learning_data
WHERE
    risk_level = 'High'
        AND placement_ready = 'No';
  
  SELECT 
    student_id,
    attendance_percentage,
    overall_readiness_score,
    risk_level,
    placement_ready,
    recommended_skill
FROM student_learning_data
WHERE risk_level = 'High'
ORDER BY overall_readiness_score ASC; 

SELECT 
    risk_level,
    COUNT(*) AS student_count
FROM student_learning_data
GROUP BY risk_level
ORDER BY student_count DESC;

SELECT 
    placement_ready,
    COUNT(*) AS student_count
FROM student_learning_data
GROUP BY placement_ready
ORDER BY student_count DESC;

SELECT
    AVG(attendance_percentage) AS avg_attendance,
    AVG(technical_readiness_score) AS avg_technical_readiness,
    AVG(interview_readiness_score) AS avg_interview_readiness,
    AVG(overall_readiness_score) AS avg_overall_readiness
FROM student_learning_data; 

USE student_learning_db;

SELECT
    AVG(attendance_percentage) AS avg_attendance,
    AVG(technical_readiness_score) AS avg_technical_readiness,
    AVG(interview_readiness_score) AS avg_interview_readiness,
    AVG(overall_readiness_score) AS avg_overall_readiness
FROM student_learning_data;

SELECT
    risk_level,
    AVG(overall_readiness_score) AS avg_overall_readiness
FROM student_learning_data
GROUP BY risk_level
ORDER BY avg_overall_readiness DESC; 

SELECT
    placement_ready,
    AVG(overall_readiness_score) AS avg_overall_readiness
FROM student_learning_data
GROUP BY placement_ready
ORDER BY avg_overall_readiness DESC; 

SELECT
    risk_level,
    AVG(technical_readiness_score) AS avg_technical_readiness
FROM student_learning_data
GROUP BY risk_level
ORDER BY avg_technical_readiness DESC; 

SELECT
    risk_level,
    AVG(interview_readiness_score) AS avg_interview_readiness
FROM student_learning_data
GROUP BY risk_level
ORDER BY avg_interview_readiness DESC; 

SELECT
    AVG(attendance_percentage) AS avg_attendance,
    AVG(technical_readiness_score) AS avg_technical_readiness,
    AVG(interview_readiness_score) AS avg_interview_readiness
FROM student_learning_data;

SELECT
    student_id,
    overall_readiness_score,
    risk_level,
    placement_ready
FROM student_learning_data
ORDER BY overall_readiness_score ASC
LIMIT 10;

SELECT
    student_id,
    overall_readiness_score,
    risk_level,
    placement_ready
FROM student_learning_data
ORDER BY overall_readiness_score DESC
LIMIT 10; 

SELECT
    risk_level,
    placement_ready,
    COUNT(*) AS student_count,
    AVG(overall_readiness_score) AS avg_overall_readiness
FROM student_learning_data
GROUP BY risk_level, placement_ready
ORDER BY risk_level, placement_ready; 

SELECT
    risk_level,
    placement_ready,
    COUNT(*) AS student_count
FROM student_learning_data
GROUP BY risk_level, placement_ready
ORDER BY student_count DESC;

SELECT
    risk_level,
    AVG(attendance_percentage) AS avg_attendance
FROM student_learning_data
GROUP BY risk_level
ORDER BY avg_attendance DESC; 

SELECT
    risk_level,
    COUNT(*) AS student_count,
    ROUND(AVG(attendance_percentage), 2) AS avg_attendance,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness
FROM student_learning_data
GROUP BY risk_level
ORDER BY avg_readiness DESC;

DESCRIBE student_learning_data; 

SELECT
    recommended_topic,
    COUNT(*) AS student_count
FROM student_learning_data
GROUP BY recommended_topic
ORDER BY student_count DESC; 

SELECT 
    recommended_skill,
    COUNT(*) AS student_count
FROM student_learning_data
GROUP BY recommended_skill
ORDER BY student_count DESC; 
  USE student_learning_db; 
  
  SELECT 
    recommended_skill,
    COUNT(*) AS student_count
FROM student_learning_db.student_learning_data
GROUP BY recommended_skill
ORDER BY student_count DESC; 

SELECT
    risk_level,
    COUNT(*) AS student_count,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness_score
FROM student_learning_db.student_learning_data
GROUP BY risk_level
ORDER BY avg_readiness_score DESC; 

SELECT
    placement_ready,
    COUNT(*) AS student_count,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness_score
FROM student_learning_db.student_learning_data
GROUP BY placement_ready
ORDER BY avg_readiness_score DESC; 

SELECT
    risk_level,
    placement_ready,
    COUNT(*) AS student_count
FROM student_learning_db.student_learning_data
GROUP BY risk_level, placement_ready
ORDER BY risk_level, placement_ready; 

SELECT
    risk_level,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness,
    ROUND(AVG(technical_score), 2) AS avg_technical,
    ROUND(AVG(aptitude_score), 2) AS avg_aptitude,
    ROUND(AVG(communication_score), 2) AS avg_communication
FROM student_learning_db.student_learning_data
GROUP BY risk_level
ORDER BY avg_readiness DESC; 
SELECT
    ROUND(AVG(technical_score), 2) AS avg_technical,
    ROUND(AVG(aptitude_score), 2) AS avg_aptitude,
    ROUND(AVG(communication_score), 2) AS avg_communication
FROM student_learning_db.student_learning_data; 

SELECT
    student_id,
    overall_readiness_score,
    risk_level,
    placement_ready,
    recommended_topic,
    recommended_skill
FROM student_learning_db.student_learning_data
ORDER BY overall_readiness_score ASC
LIMIT 10; 

SELECT
    student_id,
    overall_readiness_score,
    risk_level,
    placement_ready,
    recommended_topic,
    recommended_skill
FROM student_learning_db.student_learning_data
ORDER BY overall_readiness_score DESC
LIMIT 10; 

SELECT
    recommended_skill,
    COUNT(*) AS student_count,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness_score
FROM student_learning_db.student_learning_data
GROUP BY recommended_skill
ORDER BY avg_readiness_score ASC; 

SELECT
    recommended_topic,
    COUNT(*) AS student_count,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness_score
FROM student_learning_db.student_learning_data
GROUP BY recommended_topic
ORDER BY avg_readiness_score ASC; 

SELECT
    risk_level,
    recommended_skill,
    COUNT(*) AS student_count
FROM student_learning_db.student_learning_data
GROUP BY risk_level, recommended_skill
ORDER BY risk_level, student_count DESC;

SELECT
    risk_level,
    recommended_topic,
    COUNT(*) AS student_count
FROM student_learning_db.student_learning_data
GROUP BY risk_level, recommended_topic
ORDER BY risk_level, student_count DESC; 

SELECT
    placement_ready,
    recommended_skill,
    COUNT(*) AS student_count
FROM student_learning_db.student_learning_data
GROUP BY placement_ready, recommended_skill
ORDER BY placement_ready, student_count DESC; 

SELECT
    placement_ready,
    recommended_topic,
    COUNT(*) AS student_count
FROM student_learning_db.student_learning_data
GROUP BY placement_ready, recommended_topic
ORDER BY placement_ready, student_count DESC; 

SELECT
    placement_ready,
    COUNT(*) AS student_count,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness,
    ROUND(AVG(technical_score), 2) AS avg_technical,
    ROUND(AVG(aptitude_score), 2) AS avg_aptitude,
    ROUND(AVG(communication_score), 2) AS avg_communication
FROM student_learning_db.student_learning_data
GROUP BY placement_ready
ORDER BY avg_readiness DESC; 

SELECT
    risk_level,
    COUNT(*) AS student_count,
    ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) 
                               FROM student_learning_db.student_learning_data), 2) AS percentage
FROM student_learning_db.student_learning_data
GROUP BY risk_level
ORDER BY student_count DESC; 

SELECT
    placement_ready,
    COUNT(*) AS student_count,
    ROUND(
        COUNT(*) * 100.0 /
        (SELECT COUNT(*)
         FROM student_learning_db.student_learning_data),
        2
    ) AS percentage
FROM student_learning_db.student_learning_data
GROUP BY placement_ready
ORDER BY student_count DESC; 

SELECT
    risk_level,
    placement_ready,
    COUNT(*) AS student_count,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness
FROM student_learning_db.student_learning_data
GROUP BY risk_level, placement_ready
ORDER BY risk_level, placement_ready; 

SELECT
    risk_level,
    ROUND(AVG(technical_score), 2) AS avg_technical,
    ROUND(AVG(aptitude_score), 2) AS avg_aptitude,
    ROUND(AVG(communication_score), 2) AS avg_communication
FROM student_learning_db.student_learning_data
GROUP BY risk_level
ORDER BY risk_level; 

SELECT
    risk_level,
    ROUND(AVG(technical_score), 2) AS avg_technical,
    ROUND(AVG(aptitude_score), 2) AS avg_aptitude,
    ROUND(AVG(communication_score), 2) AS avg_communication
FROM student_learning_db.student_learning_data
GROUP BY risk_level
ORDER BY risk_level; 

SELECT
    ROUND(MIN(overall_readiness_score), 2) AS min_readiness,
    ROUND(MAX(overall_readiness_score), 2) AS max_readiness,
    ROUND(AVG(overall_readiness_score), 2) AS avg_readiness,
    ROUND(STDDEV(overall_readiness_score), 2) AS std_deviation
FROM student_learning_db.student_learning_data; 

SELECT
    CASE
        WHEN overall_readiness_score < 40 THEN 'Below 40'
        WHEN overall_readiness_score < 60 THEN '40-59'
        WHEN overall_readiness_score < 80 THEN '60-79'
        ELSE '80+'
    END AS readiness_range,
    COUNT(*) AS student_count
FROM student_learning_db.student_learning_data
GROUP BY readiness_range
ORDER BY
    CASE readiness_range
        WHEN 'Below 40' THEN 1
        WHEN '40-59' THEN 2
        WHEN '60-79' THEN 3
        WHEN '80+' THEN 4
    END; 
    
    SELECT
    recommended_topic,
    COUNT(*) AS high_risk_students
FROM student_learning_db.student_learning_data
WHERE risk_level = 'High'
GROUP BY recommended_topic
ORDER BY high_risk_students DESC; 