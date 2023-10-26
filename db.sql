CREATE DATABASE IF NOT EXISTS usof;
DROP USER IF EXISTS 'dshchepin'@'localhost';
CREATE USER 'dshchepin'@'localhost' IDENTIFIED BY 'securepass';
GRANT ALL PRIVILEGES ON usof.* TO 'dshchepin'@'localhost';
USE usof;

CREATE TABLE IF NOT EXISTS users(
    user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    login VARCHAR(255) NOT NULL UNIQUE,
    password TINYTEXT NOT NULL,
    full_name TINYTEXT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    profile_picture VARCHAR(255),
    rating INT NOT NULL DEFAULT 0,
    role ENUM('admin', 'user') NOT NULL DEFAULT 'user'
);

CREATE TABLE IF NOT EXISTS categories(
    category_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS posts(
    post_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    author_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    publish_date DATETIME NOT NULL,
    status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    content TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 0,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post_categories(
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS favorite_posts(
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comments(
    comment_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    author_id INT NOT NULL,
    post_id INT NOT NULL,
    FOREIGN KEY (author_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    publish_date DATETIME NOT NULL,
    content TEXT NOT NULL,
    rating INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS likes(
    like_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    publish_date DATETIME NOT NULL,
    post_id INT NULL,
    user_id INT NOT NULL,
    comment_id INT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES posts(post_id) ON DELETE CASCADE,
    FOREIGN KEY (comment_id) REFERENCES comments(comment_id) ON DELETE CASCADE,
    type ENUM('like', 'dislike') NOT NULL
);

-- PASSWORDS FOR USERS:
-- john_doe: 12345
-- sara_smith: password
-- ! admin: admin
-- mike_jackson: securepass
-- emily_jones: jojo09

INSERT INTO users (login, password, full_name, email, profile_picture, rating, role)
VALUES 
    ('john_doe', '$2b$10$xzfp38Yv6XO6n2UYrfQMoO.GmrWX1DGbqgxMXEXDZdnyw6AkEWzZS', 'John Doe', 'john_doe@example.com', 'john_doe.jpg', 3, 'user'),
    ('sara_smith', '$2b$10$Ep9RAMWObyaVwJu83uTqLuFGleidhcSLyRL7ty7upBSU5FgYYvNi.', 'Sara Smith', 'sara_smith@example.com', 'sara_smith.jpg', -1, 'user'),
    ('admin', '$2b$10$nS0OWOalu.4e/SZHwR9wde.FsW7phT8z9tjzuOKNeY07ErdpPDuLy', 'Administrator', 'admin@example.com', 'admin.jpg', 3, 'admin'), 
    ('mike_jackson', '$2b$10$eVLnQMU6XgWNySvhEn9F2OqHvDZezkSI8Z230Hr554/xiyrOvtxKK', 'Mike Jackson', 'mike_jackson@example.com', 'mike_jackson.jpg', 1, 'user'),
    ('emily_jones', '$2b$10$VDrdH.oeykv7J2Q.PbHkOOU5UMb9weTV.rS3Zs.Lt420MKEmJZXze', 'Emily Jones', 'emily_jones@example.com', 'emily_jones.jpg', 1, 'user');

INSERT INTO categories (title, description)
VALUES 
    ('Java', 'Questions related to Java programming language'),
    ('Python', 'Questions related to Python programming language'),
    ('JavaScript', 'Questions related to JavaScript programming language'),
    ('SQL', 'Questions related to SQL queries and databases'),
    ('HTML/CSS', 'Questions related to web development with HTML and CSS');

INSERT INTO posts (author_id, title, publish_date, status, content, rating)
VALUES 
    (1, 'How to declare a variable in Java?', '2023-10-09 12:00:00', 'active', 'I am new to Java and need help understanding how to declare variables. Can someone provide examples and explanations?', 2),
    (2, 'Best practices for error handling in Python', '2023-10-10 14:30:00', 'active', 'I want to improve my error handling in Python. What are some best practices and common strategies?', -1),
    (3, 'Understanding object-oriented programming in Java', '2023-10-11 16:45:00', 'active', 'I am struggling with understanding OOP concepts in Java. Can someone explain with simple examples?', 2),
    (4, 'How to manipulate the DOM in JavaScript', '2023-10-12 10:00:00', 'inactive', 'I need to dynamically update my web page using JavaScript. How can I manipulate the DOM to achieve this?', 0),
    (5, 'How to structure a Python program', '2023-10-13 09:00:00', 'active', 'What is the best way to structure a Python program for maintainability and scalability?', 0),
    (1, 'JavaScript DOM', '2023-10-13 09:00:00', 'active', 'How to work with DOM?', 0);

INSERT INTO comments (author_id, post_id, publish_date, content, rating)
VALUES 
    (2, 1, '2023-10-09 13:00:00', 'You can declare a variable in Java using the syntax: int variableName; or String str = "Hello";', 1),
    (1, 2, '2023-10-10 15:00:00', 'One good practice for error handling in Python is using try...except blocks to handle exceptions gracefully.', 0),
    (4, 3, '2023-10-11 17:00:00', 'In object-oriented programming, objects are instances of classes that encapsulate data and behavior related to that data.', 1),
    (1, 4, '2023-10-12 11:00:00', 'To manipulate the DOM in JavaScript, you can use methods like getElementById, innerHTML, etc. to access and modify the content of HTML elements.', 1),
    (3, 5, '2023-10-13 10:00:00', 'A good Python program structure often involves organizing code into modules and using functions to break down the logic into manageable pieces.', 1);

INSERT INTO likes (publish_date, post_id, user_id, comment_id, type)
VALUES 
    ('2023-10-09 14:00:00', 1, 2, NULL, 'like'),
    ('2023-10-10 16:00:00', 1, 3, NULL, 'like'),
    ('2023-10-11 18:00:00', 2, 3, NULL, 'dislike'),
    ('2023-10-10 16:00:00', 3, 1, NULL, 'like'),
    ('2023-10-11 18:00:00', 3, 2, NULL, 'like'),
    ('2023-10-12 12:00:00', NULL, 4, 1, 'like'),
    ('2023-10-18 19:30:00', NULL, 2, 3, 'like'),
    ('2023-10-16 12:00:00', NULL, 1, 4, 'like'),
    ('2023-10-17 11:00:00', NULL, 3, 5, 'like');

INSERT INTO post_categories (post_id, category_id)
VALUES 
    (1, 1),
    (2, 2),
    (3, 3),
    (4, 4),
    (5, 5),
    (6, 3);

INSERT INTO favorite_posts (post_id, user_id)
VALUES 
    (1, 3),
    (1, 4),
    (2, 1),
    (3, 4),
    (1, 2),
    (2, 5);
