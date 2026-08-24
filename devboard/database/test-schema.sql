drop database if exists devboard_test;
create database devboard_test;
use devboard_test;

create table `user` (
    user_id bigint primary key auto_increment,
    email text not null,
    display_name varchar(50) not null,
    password text not null,
    created_at timestamp not null
);

delimiter //
create procedure set_known_good_state()
begin
	delete from `user`;
    alter table `user` auto_increment = 1;

    insert into `user` (email, display_name, password, created_at) values
        ("a@a.com", "a","pass",NOW()),
        ("b@b.com", "b","pass",NOW());
end //
delimiter ;