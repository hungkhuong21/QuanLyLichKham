import org.example.Init;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.Select;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.Test;

import java.time.Duration;

public class bac_si extends Init {
    WebDriver driver;

    By name = By.id("name");
    By email = By.id("email");
    By phone = By.id("phone");
    By department = By.id("department");
    By btnSubmit = By.id("btn-submit");
    By alertMessage = By.cssSelector(".alert");

    public bac_si(WebDriver driver) {
        this.driver = driver;
    }

    public void enterName(String txt) {
        driver.findElement(name).sendKeys(txt);
    }

    public void enterEmail(String txt) {
        driver.findElement(email).sendKeys(txt);
    }

    public void enterPhone(String txt) {
        driver.findElement(phone).sendKeys(txt);
    }

    public void chooseDepartment(String value) {
        new Select(driver.findElement(department)).selectByVisibleText(value);
    }

    public void clickSubmit() {
        driver.findElement(btnSubmit).click();
    }

    public String getAlert() {
        return driver.findElement(alertMessage).getText();
    }

    @Test
    public void TC_01_1_AddDoctorSuccessfully() {
        WebDriver driver = new ChromeDriver();
        driver.manage().window().maximize();
        driver.get("http://localhost:4200");

        // Click đăng nhập
        driver.findElement(By.xpath("//button[contains(text(),'Đăng Nhập')]")).click();
        driver.findElement(By.id("email")).sendKeys("admin@gmail.com");
        driver.findElement(By.id("password")).sendKeys("123456");
        driver.findElement(By.id("loginBtn")).click();

        // Mở form thêm bác sĩ
        driver.findElement(By.xpath("//button[contains(text(),'Thêm bác sĩ')]")).click();

        // Nhập form
        driver.findElement(By.id("name")).sendKeys("Nguyễn Văn A");
        driver.findElement(By.id("email")).sendKeys("bsA@gmail.com");
        driver.findElement(By.id("spec")).sendKeys("Tim mạch");

        driver.findElement(By.id("saveBtn")).click();

        // Expected result
        WebElement toast = new WebDriverWait(driver, Duration.ofSeconds(5))
                .until(ExpectedConditions.visibilityOfElementLocated(By.xpath("//*[contains(text(),'Thêm thành công')]")));

        Assert.assertTrue(toast.isDisplayed());

        driver.quit();
    }
}
