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

#POST markdown to v1/fragment
POST http://localhost:8080/v1/fragments
Content-type: text/markdown

#include http basic credentials
[BasicAuth]
user1@email.com:password1

# Body of the request
`DynamoDB is **great**.`

# Expected HTTP 201 Created for 2nd fragment
HTTP/1.1 201
[Asserts]
jsonpath "$.status" == "ok"
jsonpath "$.fragment.id" isString
jsonpath "$.fragment.type" == "text/markdown"

# Capture the 2nd Location URL into a variable named `url`
[Captures]
url_2: header "Location"
fragment2_id: header "Location" regex "fragments/(.+)"

#Try to get the 2nd fragment/ info  by its URL
GET {{url_2}}/info
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-type : application/json; charset=utf-8
[Asserts]
# Our fragment ids use UUIDs,
jsonpath "$.fragment.id" matches "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
# Our ownerId hash is a hex encoded string
jsonpath "$.fragment.ownerId" matches "^[0-9a-fA-F]+$"
# Basic check for the presence of created and updated date strings.
# You could also write a regex for this and use matches
jsonpath "$.fragment.created" isString
jsonpath "$.fragment.updated" isString
jsonpath "$.fragment.type" == "text/markdown"
jsonpath "$.fragment.size" == 22

# 2. Try to get the list of fragments
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

HTTP/1.1 200
Content-type : application/json; charset=utf-8
[Asserts]
jsonpath "$.fragments" includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}


# Delete the 1st fragment 
DELETE {{url_1}}
[BasicAuth] 
user1@email.com:password1

HTTP/1.1 200


# Try to GET the 1st fragment again
GET {{url_1}}
[BasicAuth]
user1@email.com:password1

HTTP/1.1 404
Content-Type: application/json; charset=utf-8
[Asserts]
jsonpath "$.status" == "error"
jsonpath "$.error.message" == "Fragment not found"

# Try to get the list of fragments after delete
GET http://localhost:8080/v1/fragments
[BasicAuth]
user1@email.com:password1

# the fragment1_id is now not included but the fragment2_id
HTTP/1.1 200
Content-type : application/json; charset=utf-8
[Asserts]
jsonpath "$.fragments" not includes {{fragment1_id}}
jsonpath "$.fragments" includes {{fragment2_id}}







