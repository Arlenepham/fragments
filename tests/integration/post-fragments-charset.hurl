# POST to /v1/fragments with Content-Type text/plain; charset=utf-8
POST http://localhost:8080/v1/fragments
Content-Type: text/plain; charset=utf-8

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# Body of the request
`This is a UTF-8 encoded fragment`

# Expecting HTTP 201 Created
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" isString
jsonpath "$.fragment.type" == "text/plain"

# Capture the Location URL into a variable named `url`
[Captures]
url: header "Location"

# 2. Try to GET the fragment we just posted by its URL
GET {{url}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-Type: text/plain
[Asserts]
body == "This is a UTF-8 encoded fragment"
