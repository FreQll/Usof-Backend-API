
# USOF BACKEND  *Forum API*

# How to run:

  

> To run API on your computer, firstly download my solution to your PC,
> then navigate to project folder and then run command ```npm install```
> to install all packages, then you need to create database, by running
> command  ```mysql -u (your username in mysql) -p < db.sql``` , then
> you can run application by simply executing   ```node index.js```

  

# Endpoints:

>   [Auth Module](#Auth-Module)
> 
>   [User Module](#User-Module)
> 
>   [Post Module](#Post-Module)
> 
>   [Categories Module](#Categories-Module)
> 
>   [Comments Module](#Comments-Module)

# Auth Module
### Register
POST```http://localhost:3001/api/auth/register```

Body parameters:
* login
* email
* password
* full_name
### Login
POST```http://localhost:3001/api/auth/login```

Body parameters:
* login
* password
### Get Who Authorized
GET```http://localhost:3001/api/auth```

Return login of user who currently authorized and his role
### Logout
POST```http://localhost:3001/api/auth/logout```

Logout from current session
### Send Password Reset
POST```http://localhost:3001/api/auth/password-reset```

Body parameters:
* email - to which will go link
### Password Reset Confirm
POST```http://localhost:3001/api/auth/password-reset/:token```

Body parameters:
* password
This reset password to new one

# User Module

### Get All Users
GET ```http://localhost:3001/api/users```

Simply returns all users data, and also you can search among them, by adding query parameter **search**
For example: GET```http://localhost:3001/api/users?search=*```

### Get User By ID
GET```http://localhost:3001/api/users/:id```

Where id is user_id
### Get User By Login
GET```http://localhost:3001/api/users/profile/:login```

### Get User Avatar
GET```http://localhost:3001/api/users/avatar/*.jpg```

### Get Favorite Posts
GET```http://localhost:3001/api/users/:id/favorites```

Where id is user_id
### Create User
POST```http://localhost:3001/api/users```

You should pass parameters to body to create user such as *login, password, full_name, email, profile_picture, rating, role*. **This feature only for users with admin role**
### Add Post To Favorite
POST```http://localhost:3001/api/users/:id/favorites```

Where id is post_id
### Update User
PATCH```http://localhost:3001/api/users/:id```

Where id is user_id
You can update user data, *only user can change his own data and admins*
### Update Avatar
PATCH```http://localhost:3001/api/users/avatar```

*Required parameters for body is image and login, only user can change his own avatar and admins*
### Delete User
DELETE```http://localhost:3001/api/users/:id```

Where id is user_id, only user by himself can delete his own account, and also admin can delete any account.
### Delete Favorite Post
DELETE```http://localhost:3001/api/users/:id/favorites```

# Post Module
### Get All Posts
GET```http://localhost:3001/api/posts/```

You can also sort and filter, here is example of using all query parameters:
```http://localhost:3001/api/posts/?page=1&pageSize=5&sortBy=publish_date&sortOrder=ASC&dateFrom=2023-10-23&dateTo=2023-10-25&statusFilter=inactive```

Where
* Page - current page
* pageSize - size of page (5 by default)
* sortBy - rating or publish_date (publish_date by default)
* sortOrder - ASC or DESC
* dateFrom - date after which you want to see posts
* dateTo - date by which you want to see posts
* statusFilter - active or inactive
### Get Post By ID
GET```http://localhost:3001/api/posts/:id```

Where id is post_id
### Get All Comments Under Post
GET```http://localhost:3001/api/posts/:id/comments```

Where id is post_id
### Get All Categories For Post
GET```http://localhost:3001/api/posts/:id/categories```

Where id is post_id
### Get All Likes Under Post
GET```http://localhost:3001/api/posts/:id/like```

Where id is post_id
### Create Post
POST```http://localhost:3001/api/posts```

You can create new post, body parameters:
* title - title of post
* content - content of post
* author_id - id of author for this post
* categories - categories of post, passing by number of category_id, you can pass one category and also array of categories, like ```"categories":  [1,  4]```
* 
### Create Like Under Post
POST```http://localhost:3001/api/posts/:id/like```

Where id is post_id
Body parameters:
* type - like or dislike (by default like)
* user_id - id of user who liked
### Create Comment Under Post
POST```http://localhost:3001/api/posts/:id/comments```

Where id is post_id
Body parameters:
* content
* author_id
### Update Post
PATCH```http://localhost:3001/api/posts/:id```

You can update *title, content, status* and rating *(but anyway it automatically calculated, so technically, you can`t)*
### Delete Post
DELETE```http://localhost:3001/api/posts/:id``` 

Where id is post_id
### Delete Like From Post
DELETE```http://localhost:3001/api/posts/:id/like```

Where id is post_id

# Categories Module
### Get All Categories
GET```http://localhost:3001/api/categories```

### Get Category By ID
GET```http://localhost:3001/api/categories/:id```

Where id is category_id
### Get All Posts By Category
GET```http://localhost:3001/api/categories/:id/posts```

Where id is category_id
Query parameters:
* page - default 1
* pageSize - default 5
### Create Category
POST```http://localhost:3001/api/categories```

Body parameters:
* title
* description
### Update Category
POST```http://localhost:3001/api/categories/:id```

Where id is category_id
Body parameters:
* title
* description
### Delete Category
DELETE```http://localhost:3001/api/categories/:id```

Where id is category_id

# Comments Module
### Get Comment By ID
GET```http://localhost:3001/api/comments/:id```

Where id is comment_id
### Get Likes Under Comment
GET```http://localhost:3001/api/comments/:id/like```

Where id is comment_id
### Create Like Under Comment
POST```http://localhost:3001/api/comments/:id/like```

Where id is comment_id
Body parameters:
* user_id - id of who posted like
### Update Comment
PATCH```http://localhost:3001/api/comments/:id```

Where id is comment_id
Body parameters:
* content
### Delete Comment
DELETE```http://localhost:3001/api/comments/:id```

Where id is comment_id
### Delete Like Under Comment
DELETE```http://localhost:3001/api/comments/:id/like```

Where id is comment_id

> Made by @Freql
