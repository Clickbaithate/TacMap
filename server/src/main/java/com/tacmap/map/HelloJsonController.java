package com.tacmap.map;

import java.util.Map;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloJsonController {
  @RequestMapping("/!")
  public Map<String, String> index() {
    return Map.of("message", "Hello, World!");
  }
}
