package com.tacmap.map;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

@RestController
public class HelloRestController {
  @RequestMapping("/world")
  public String index() {
    return "Hello, World!";
  }
}
