drop database if exists devboard_test;
create database devboard_test;
use devboard_test;

create table users (
    id bigint primary key auto_increment,
    email text not null,
    display_name varchar(50) not null,
    password text not null,
    created_at timestamp not null
);