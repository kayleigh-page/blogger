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

## Add a site
### Query
```
mutation AddSite($name: String!, $url: String!) {
  addSite(name: $name, url: $url) {
    id
    name
    url
  }
}
```
### Query Variables
```
{
  "name": "Kayleigh Page",
  "url": "https://kayleigh.page"
}
```

## List all sites for logged in user
### Query
```
query {
  getSites {
    id
    name
    url
  }
}
```

## Get one site
### Query
```
query GetSite($id: String!) {
  getSite(id: $id) {
    id
    name
    url
  }
}
```
### Query Variables
```
{
  "id": "SITE_ID_HERE"
}
```

## Update a site
### Query
```
mutation UpdateSite(
  $id: String!
  $name: String
  $url: String
  $description: String
  $picture: String
) {
  updateSite(
    id: $id
    name: $name
    url: $url
    description: $description
    picture: $picture
  ) {
    id
    name
    url
    description
    picture
  }
}
```
### Query Variables
```
{
  "id": "SITE_ID_HERE",
  "name": "Updated Name",
  "url": "https://updated-url.com",
  "description": "A new description",
  "picture": "https://example.com/image.jpg"
}
```

## Delete a site
### Query
```
mutation DeleteSite($id: String!) {
  deleteSite(id: $id)
}
```
### Query Variables
```
{
  "id": "SITE_ID_HERE"
}
```