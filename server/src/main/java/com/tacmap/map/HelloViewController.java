package com.tacmap.map;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class HelloViewController {
  @RequestMapping("/hello")
  public String index() {
    return "index.html";
  }
}
