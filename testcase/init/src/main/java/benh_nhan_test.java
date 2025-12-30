import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.AfterMethod;
import org.testng.annotations.BeforeMethod;
import org.testng.annotations.Test;

import java.time.Duration;

public class benh_nhan_test {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(6));

        driver.get("http://localhost:4200");

        driver.findElement(By.xpath("//button[contains(text(),'Đăng Nhập')]")).click();
        driver.findElement(By.id("email")).sendKeys("admin@gmail.com");
        driver.findElement(By.id("password")).sendKeys("123456");
        driver.findElement(By.id("loginBtn")).click();

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//a[contains(text(),'Bệnh nhân')]")
        )).click();

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Thêm bệnh nhân')]")
        )).click();
    }

    @AfterMethod
    public void teardown() {
        driver.quit();
    }

    @Test
    public void TC_06_1_AddPatientSuccess() {
        driver.findElement(By.id("name")).sendKeys("Nguyễn Văn B");
        driver.findElement(By.id("phone")).sendKeys("0912345678");
        driver.findElement(By.id("address")).sendKeys("TP. HCM");
        driver.findElement(By.id("email")).sendKeys("patientA@gmail.com");

        driver.findElement(By.id("saveBtn")).click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Thêm thành công')]")
        ));

        Assert.assertTrue(toast.isDisplayed());
    }

    @Test
    public void TC_06_2_ValidateMissingName() {
        driver.findElement(By.id("phone")).sendKeys("0912345678");
        driver.findElement(By.id("address")).sendKeys("Hà Nội");
        driver.findElement(By.id("email")).sendKeys("patientB@gmail.com");

        driver.findElement(By.id("saveBtn")).click();

        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Tên không được để trống')]")
        ));

        Assert.assertTrue(error.isDisplayed());
    }

    @Test
    public void TC_07_1_InvalidPhoneFormat() {
        driver.findElement(By.id("name")).sendKeys("Bệnh nhân C");
        driver.findElement(By.id("phone")).sendKeys("12345");
        driver.findElement(By.id("address")).sendKeys("Đà Nẵng");
        driver.findElement(By.id("email")).sendKeys("patientC@gmail.com");

        driver.findElement(By.id("saveBtn")).click();

        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Số điện thoại không hợp lệ')]")
        ));

        Assert.assertTrue(error.isDisplayed());
    }

    @Test
    public void TC_07_2_AllFieldsEmpty() {
        driver.findElement(By.id("saveBtn")).click();

        WebElement errorName = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Tên không được để trống')]")
        ));

        WebElement errorPhone = driver.findElement(
                By.xpath("//*[contains(text(),'Số điện thoại không hợp lệ')]")
        );

        Assert.assertTrue(errorName.isDisplayed());
        Assert.assertTrue(errorPhone.isDisplayed());
    }

    @Test
    public void TC_08_1_SearchPatientFullName() {
        // Close add form if open
        driver.findElement(By.xpath("//button[contains(text(),'Hủy')]")).click();

        WebElement searchBox = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("searchInput")
        ));
        searchBox.sendKeys("Nguyễn Văn B");

        WebElement result = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//td[contains(text(),'Nguyễn Văn B')]")
        ));

        Assert.assertTrue(result.isDisplayed());
    }

    @Test
    public void TC_08_2_SearchNotFound() {
        driver.findElement(By.xpath("//button[contains(text(),'Hủy')]")).click();

        driver.findElement(By.id("searchInput")).sendKeys("TênKhôngTồnTại");

        WebElement message = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Không tìm thấy bệnh nhân')]")
        ));

        Assert.assertTrue(message.isDisplayed());
    }

    @Test
    public void TC_09_ViewPatientDetail() {
        driver.findElement(By.xpath("//button[contains(text(),'Hủy')]")).click();

        driver.findElement(By.id("searchInput")).sendKeys("Nguyễn Văn B");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Xem')]")
        )).click();

        WebElement title = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Thông tin bệnh nhân')]")
        ));

        Assert.assertTrue(title.isDisplayed());
    }

    @Test
    public void TC_10_1_UpdateValid() {
        driver.findElement(By.xpath("//button[contains(text(),'Hủy')]")).click();

        driver.findElement(By.id("searchInput")).sendKeys("Nguyễn Văn B");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Sửa')]")
        )).click();

        WebElement addressField = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("address")
        ));

        addressField.clear();
        addressField.sendKeys("Hà Nội");

        driver.findElement(By.id("saveBtn")).click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Cập nhật thành công')]")
        ));

        Assert.assertTrue(toast.isDisplayed());
    }

    @Test
    public void TC_10_2_UpdateDuplicateEmail() {
        driver.findElement(By.xpath("//button[contains(text(),'Hủy')]")).click();

        driver.findElement(By.id("searchInput")).sendKeys("Nguyễn Văn B");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.xpath("//button[contains(text(),'Sửa')]")
        )).click();

        WebElement emailField = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("email")
        ));

        emailField.clear();
        emailField.sendKeys("test@gmail.com");   // email đã tồn tại

        driver.findElement(By.id("saveBtn")).click();

        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Email đã tồn tại')]")
        ));

        Assert.assertTrue(error.isDisplayed());
    }
}
