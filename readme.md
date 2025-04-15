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

## Set up 2FA
(Add authorization header first -> Key: Authorization Value: Bearer jwt-token-you-get-from-login-mutation)
### Query
```
mutation {
  setup2FA
}
```

## Verify and enable 2FA
### Query
```
mutation Verify($token: String!) {
  verify2FA(token: $token)
}
```
### Query Variables
```
{
  "token": "123456"
}
```
