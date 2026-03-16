Requirements

1. Register user details in db
2. Login, logout and auth handled by iam'
3. IAM should be calling these endpoints

Things IAM should be doing :

Normal users
1. Normal user registration - update user details in our database [done]
2. When user changes credentials, those should be again updated in our database [todo]

Staff
1. Update details and such reflected back in our database , accounts created manually by an IAM admin 
2. Update online status upoun login in our database
3. Reupdate online status upoun logout in our database
3. My account for staff not needed