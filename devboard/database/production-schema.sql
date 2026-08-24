drop database if exists devboard;
create database devboard;
use devboard;

create table users (
    id bigint primary key auto_increment,
    email text not null,
    display_name varchar(50) not null,
    password text not null,
    created_at timestamp not null
);