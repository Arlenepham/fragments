# POST to /v1/fragments without authentication
POST http://localhost:8080/v1/fragments
Content-Type: text/plain

# No BasicAuth provided here

# Body of the request
`This is an unauthenticated fragment`

# Expecting HTTP 401 Unauthorized
HTTP/1.1 401
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Unauthorized"