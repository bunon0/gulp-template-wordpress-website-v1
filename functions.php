<?php

function add_setup()
{
  add_theme_support("post-thumbnails");
  add_theme_support("automatic-feed-links");
  add_theme_support("title-tag");
  add_theme_support(
    "html5",
    array(
      "search-form",
      "comment-form",
      "comment-list",
      "gallery",
      "caption",
    )
  );
}
add_action("after_setup_theme", "add_setup");

function add_styles()
{
  wp_enqueue_style('styles', get_template_directory_uri() . '/assets/css/style.css', array(), '1.0.0', 'all');
}
add_action('wp_enqueue_scripts', 'add_styles');

function add_scripts()
{
  wp_enqueue_script('main', get_template_directory_uri() . '/assets/js/main.js', array(), '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'add_scripts');