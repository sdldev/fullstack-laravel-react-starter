# MySQL (private) Setup

- Bind MySQL to the private IP of the DB VPS (e.g., 10.10.0.30:3306)
- Create one database and user per site; grant minimal privileges to that DB only
- Basic tuning (adjust to your RAM):
  - `innodb_buffer_pool_size=4G`
  - `max_connections=500`
- Connectivity in Laravel .env:
```
DB_CONNECTION=mysql
DB_HOST=10.10.0.30
DB_PORT=3306
DB_DATABASE=your_db
DB_USERNAME=your_user
DB_PASSWORD=your_pass
```
- Ensure firewall allows only the App VPS IP to connect to 3306.
