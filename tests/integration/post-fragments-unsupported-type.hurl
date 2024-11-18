# POST to /v1/fragments with an unsupported Content-Type
POST http://localhost:8080/v1/fragments
Content-Type: application/xml

# Include HTTP Basic Auth credentials
[BasicAuth]
user1@email.com:password1

# Body of the request (XML example)
`<fragment>This is a fragment</fragment>`

# Expecting HTTP 415 Unsupported Media Type
HTTP/1.1 415
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Unsupported Content-Type"
