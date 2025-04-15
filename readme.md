# Blogger
A backend API for all my websites.
It features:
- Blogs
- Newsletter subscribers
- Portfolio items

# API Tests
## Register
### Query
```
mutation Register($email: String!, $password: String!) {
  register(email: $email, password: $password) {
    id
    email
  }
}
```
### Query Variables
```
{
	"email": "user@domain.tld",
	"password": "SuperSecurePass"
}
```

## Login
### Query
```
mutation Login($email: String!, $password: String!, $token: String) {
  login(email: $email, password: $password, token: $token)
}
```
### Query Variables
```
{
	"email": "user@domain.tld",
	"password": "SuperSecurePass",
	"token": null
}
```