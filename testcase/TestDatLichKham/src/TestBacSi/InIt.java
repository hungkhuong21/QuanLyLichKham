package TestBacSi;
import java.time.Duration;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.edge.EdgeDriver;
import org.openqa.selenium.firefox.FirefoxDriver;


public class InIt {
	
		public static WebDriver driver = null;

	    public static void SetUp(String browser) {
	        switch (browser.toLowerCase()) {
	            case "chrome":
	                driver = new ChromeDriver();
	                break;
	            case "firefox":
	                driver = new FirefoxDriver();
	                break;
	            case "edge":
	                driver = new EdgeDriver();
	                break;
	            default:
	                System.out.println("Browser không được hỗ trợ: " + browser);
	                return;
	        }
	        //Nó thiết lập thời gian chờ tối đa 10 giây cho tất cả các lệnh findElement() hoặc findElements().
	        driver.manage().timeouts().implicitlyWait(Duration.ofSeconds(10)); 
	        driver.manage().window().maximize();
	    }

	    public static void Teardown() throws InterruptedException {
	        Thread.sleep(2000);
	        driver.quit();
	    }
	}
}
