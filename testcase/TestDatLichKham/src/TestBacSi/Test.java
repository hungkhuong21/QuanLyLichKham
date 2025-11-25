package TestBacSi;

import TestBacSi.InIt;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.testng.Assert;
import org.testng.annotations.*;

import java.time.Duration;
import java.util.List;

public class Test extends InIt {

    WebDriver driver;
    WebDriverWait wait;

    final String ADMIN_EMAIL = "admin@gmail.com";
    final String ADMIN_PASS = "123456";

    @BeforeMethod
    public void beforeEach() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(6));
    }

    @AfterMethod
    public void afterEach() {
        if (driver != null) driver.quit();
    }

    // 1.1 - Trang chủ hiển thị
    @Test
    public void TC_1_1_HomepageLoads() {
        driver.get("http://localhost:4200");
        WebElement homeBanner = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("homeBanner")
        ));
        Assert.assertTrue(homeBanner.isDisplayed());
    }

    // 2.1 - Đăng ký tài khoản
    @Test
    public void TC_2_1_Register_Success() {
        driver.get("http://localhost:4200/register");

        driver.findElement(By.id("hoTen")).sendKeys("Nguyen Thi H Nhi");
        driver.findElement(By.id("tenDangNhap")).sendKeys("nhi_auto_test01@gmail.com");
        driver.findElement(By.id("soDienThoai")).sendKeys("0912345678");
        driver.findElement(By.id("cmnd")).sendKeys("123456789");
        driver.findElement(By.id("matKhau")).sendKeys("Aa123456");
        driver.findElement(By.id("xacNhanMatKhau")).sendKeys("Aa123456");

        driver.findElement(By.xpath("//button[contains(text(),'Đăng ký')]")).click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Đăng ký thành công')]")
        ));
        Assert.assertTrue(toast.isDisplayed());
    }

    // 2.2 - Login
    @Test
    public void TC_2_2_Login_Success() {
        driver.get("http://localhost:4200/login");

        driver.findElement(By.id("email")).sendKeys("nhi_auto_test01@gmail.com");
        driver.findElement(By.id("password")).sendKeys("Aa123456");
        driver.findElement(By.id("btnLogin")).click();

        WebElement dashboard = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("dashboard")
        ));
        Assert.assertTrue(dashboard.isDisplayed());
    }

    // 2.3 - Quên mật khẩu
    @Test
    public void TC_2_3_ForgotPassword_RequestOTP() {
        driver.get("http://localhost:4200/forgot-password");

        driver.findElement(By.id("emailForgot")).sendKeys("nhi_auto_test01@gmail.com");
        driver.findElement(By.id("btnRequestOtp")).click();

        WebElement info = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Đã gửi mã OTP')]")
        ));
        Assert.assertTrue(info.isDisplayed());
    }

    // 2.4 - Reset mật khẩu
    @Test
    public void TC_2_4_VerifyOTP_And_Reset() {
        driver.get("http://localhost:4200/forgot-password");

        driver.findElement(By.id("emailForgot")).sendKeys("nhi_auto_test01@gmail.com");
        driver.findElement(By.id("btnRequestOtp")).click();

        WebElement otpInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("otp")));
        otpInput.sendKeys("111111");

        driver.findElement(By.id("newPassword")).sendKeys("NewPass123");
        driver.findElement(By.id("confirmPassword")).sendKeys("NewPass123");
        driver.findElement(By.id("btnVerifyOtp")).click();

        WebElement success = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Đặt mật khẩu thành công')]")
        ));
        Assert.assertTrue(success.isDisplayed());
    }

    // 2.5 - admin thêm tài khoản
    @Test
    public void TC_2_5_AdminAddAccount() {
        driver.get("http://localhost:4200/login");
        driver.findElement(By.id("email")).sendKeys(ADMIN_EMAIL);
        driver.findElement(By.id("password")).sendKeys(ADMIN_PASS);
        driver.findElement(By.id("btnLogin")).click();

        driver.get("http://localhost:4200/admin/accounts");
        wait.until(ExpectedConditions.elementToBeClickable(By.id("btnAddAccount"))).click();

        driver.findElement(By.id("acc_name")).sendKeys("Tester Auto");
        driver.findElement(By.id("acc_email")).sendKeys("tester_auto01@gmail.com");
        driver.findElement(By.id("acc_phone")).sendKeys("0987654321");
        driver.findElement(By.id("acc_role")).sendKeys("User");
        driver.findElement(By.id("btnSaveAccount")).click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Thêm tài khoản thành công')]")
        ));
        Assert.assertTrue(toast.isDisplayed());
    }

    // 2.6 - tìm kiếm tài khoản
    @Test
    public void TC_2_6_SearchAccount_ByEmail() {
        driver.get("http://localhost:4200/login");
        driver.findElement(By.id("email")).sendKeys(ADMIN_EMAIL);
        driver.findElement(By.id("password")).sendKeys(ADMIN_PASS);
        driver.findElement(By.id("btnLogin")).click();

        driver.get("http://localhost:4200/admin/accounts");
        driver.findElement(By.id("searchInput")).sendKeys("tester_auto01@gmail.com");
        driver.findElement(By.id("btnSearch")).click();

        WebElement firstRow = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.cssSelector("table#accountsTable tbody tr:first-child")
        ));
        Assert.assertTrue(firstRow.getText().contains("tester_auto01@gmail.com"));
    }

    // 2.7 - xem chi tiết
    @Test
    public void TC_2_7_ViewAccount_Details() {
        driver.get("http://localhost:4200/login");
        driver.findElement(By.id("email")).sendKeys(ADMIN_EMAIL);
        driver.findElement(By.id("password")).sendKeys(ADMIN_PASS);
        driver.findElement(By.id("btnLogin")).click();

        driver.get("http://localhost:4200/admin/accounts");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("table#accountsTable tbody tr:first-child .btn-detail")
        )).click();

        WebElement detailBox = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.id("accountDetail")
        ));
        Assert.assertTrue(detailBox.isDisplayed());
    }

    // 2.8 - cập nhật tài khoản
    @Test
    public void TC_2_8_UpdateAccount() {
        driver.get("http://localhost:4200/login");
        driver.findElement(By.id("email")).sendKeys(ADMIN_EMAIL);
        driver.findElement(By.id("password")).sendKeys(ADMIN_PASS);
        driver.findElement(By.id("btnLogin")).click();

        driver.get("http://localhost:4200/admin/accounts");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("table#accountsTable tbody tr:first-child .btn-edit")
        )).click();

        WebElement nameInput = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("acc_name")));
        nameInput.clear();
        nameInput.sendKeys("Tester Auto Updated");
        driver.findElement(By.id("btnSaveAccount")).click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Cập nhật thành công')]")
        ));
        Assert.assertTrue(toast.isDisplayed());
    }

    // 2.9 - xóa tài khoản
    @Test
    public void TC_2_9_DeleteAccount() {
        driver.get("http://localhost:4200/login");
        driver.findElement(By.id("email")).sendKeys(ADMIN_EMAIL);
        driver.findElement(By.id("password")).sendKeys(ADMIN_PASS);
        driver.findElement(By.id("btnLogin")).click();

        driver.get("http://localhost:4200/admin/accounts");

        wait.until(ExpectedConditions.elementToBeClickable(
                By.cssSelector("table#accountsTable tbody tr:first-child .btn-delete")
        )).click();

        wait.until(ExpectedConditions.elementToBeClickable(By.id("confirmDeleteBtn"))).click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Xóa thành công')]")
        ));
        Assert.assertTrue(toast.isDisplayed());
    }

    // 2.10 - phân trang
    @Test
    public void TC_2_10_PaginationAccounts() {
        driver.get("http://localhost:4200/login");
        driver.findElement(By.id("email")).sendKeys(ADMIN_EMAIL);
        driver.findElement(By.id("password")).sendKeys(ADMIN_PASS);
        driver.findElement(By.id("btnLogin")).click();

        driver.get("http://localhost:4200/admin/accounts");

        List<WebElement> pages = wait.until(ExpectedConditions.visibilityOfAllElementsLocatedBy(
                By.cssSelector(".pagination li a")
        ));

        if (pages.size() >= 2) {
            pages.get(1).click();

            WebElement table = wait.until(ExpectedConditions.visibilityOfElementLocated(
                    By.id("accountsTable")
            ));
            Assert.assertTrue(table.isDisplayed());
        } else {
            Assert.assertTrue(true, "Không có phân trang");
        }
    }
}
