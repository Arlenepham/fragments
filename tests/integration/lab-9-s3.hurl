# POST to /v1/fragments with Content-Type text/plain
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

#include http basic credentials
[BasicAuth]
user1@email.com:password1

# Body of the request
`Hello S3`

# Expect HTTP 201 Created
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" isString
jsonpath "$.fragment.type" == "text/plain"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to get the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-type : text/plain
[Asserts]
body == "Hello S3"

# 3. Delete the fragment 
DELETE {{url}}
[BasicAuth] 
user1@email.com:password1

HTTP/1.1 200


# 4. Try to GET the fragment again
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Fragment not found"
