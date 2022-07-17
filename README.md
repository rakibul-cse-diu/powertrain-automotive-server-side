
# Powertrain Manufacturer Company

I build this website for an automotive manufacturing company where a company could run their B2B business by this website. This website presents technical information while demonstrating strong brand values for an manufaturing company.


## Live site link
Open live site: [Firebase Hosting link](https://power-train-5df9a.web.app/)
## Features

* User can login to the website through email and password, and also with google account as well.
* User can purchase part/tools after login.
* User can cancel their order from their dashboard.
* User can update their profile info.
* User can make payment through credit card.
* Admin can manage all product, all ordered item and also can add new parts/tools.
* Admin can make an user as admin role.


## Authors

- [@rakibul](https://www.github.com/rakibul-cse-diu)


## API Reference

#### Get all Parts/Tools

```http
  GET /parts
```
#### Add/Insert a Parts/Tools

```http
  POST /parts
```

| Tooken | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `access_tooken`      | `string` | **Required**. |

#### Update a Parts/tools

```http
  PUT /updateparts/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. |


#### Get a single Parts/tools

```http
  GET /updateparts/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. |

#### Delete a Parts/tools

```http
  DELETE /parts/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. |


#### Update Profile

```http
  PATCH /updateprofile/:email
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required**. |
| `access_tooken`      | `string` | **Required**. |



#### Make Admin

```http
  PUT /makeadmin/:id
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | **Required**. |
| `access_tooken`      | `string` | **Required**. |



## 🔗 Links
[![portfolio](https://img.shields.io/badge/my_portfolio-000?style=for-the-badge&logo=ko-fi&logoColor=white)](https://rakibulhasan-portfolio.netlify.app/)
[![linkedin](https://img.shields.io/badge/linkedin-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/md-rakibul-hasan-241b80233/)
[![twitter](https://img.shields.io/badge/twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/hridoy85_)

