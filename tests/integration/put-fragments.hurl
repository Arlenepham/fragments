#POST to v1/fragment
POST http://localhost:8080/v1/fragments
Content-type: application/json

#include http basic credentials
[BasicAuth]
user1@email.com:password1

# Body of the request
{ "service": "DynamoDB" }

# Expected HTTP 201 Created
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" isString
jsonpath "$.fragment.type" == "application/json"

# Capture the Location URL into a variable named `url`
[Captures]
url_1: header "Location"
fragment1_id: header "Location" regex "fragments/(.+)"

# 2. Try to get the fragment/ info  by its URL
GET {{url_1}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-type : application/json; charset=utf-8
[Asserts]
# Our fragment ids use UUIDs, see https://ihateregex.io/expr/uuid/
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "application/json"
jsonpath "$.fragment.size" == 25
