API="http://localhost:4741"
URL_PATH="/recipes/show"

curl "${API}${URL_PATH}/${ID}" \
  --include \
  --request GET \
  --header "Authorization: Bearer ${TOKEN}"
  # --data '{
  #   "recipe": {
  #     "title": "'"${TITLE}"'"
  #   }
  # }'

echo
