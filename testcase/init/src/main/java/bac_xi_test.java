import org.example.Init;
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

public class bac_xi_test extends Init {
    WebDriver driver;
    WebDriverWait wait;

    @BeforeMethod
    public void setup() {
        driver = new ChromeDriver();
        driver.manage().window().maximize();
        wait = new WebDriverWait(driver, Duration.ofSeconds(5));

        driver.get("http://localhost:4200");

        driver.findElement(By.xpath("//button[contains(text(),'Đăng Nhập')]")).click();
        driver.findElement(By.id("email")).sendKeys("admin@gmail.com");
        driver.findElement(By.id("password")).sendKeys("123456");
        driver.findElement(By.id("loginBtn")).click();

        // Mở form thêm bác sĩ
        wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//button[contains(text(),'Thêm bác sĩ')]")
        )).click();
    }

    @AfterMethod
    public void teardown() {
        driver.quit();
    }

    @Test
    public void TC_01_1_AddDoctorSuccess() {
        driver.findElement(By.id("name")).sendKeys("Nguyễn Văn A");
        driver.findElement(By.id("email")).sendKeys("bsA@gmail.com");
        driver.findElement(By.id("spec")).sendKeys("Tim mạch");
        driver.findElement(By.id("saveBtn")).click();

        WebElement toast = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Thêm thành công')]")
        ));

        Assert.assertTrue(toast.isDisplayed());
    }

    @Test
    public void TC_01_2_ValidateMissingName() {
        driver.findElement(By.id("email")).sendKeys("bsB@gmail.com");
        driver.findElement(By.id("spec")).sendKeys("Nhi khoa");
        driver.findElement(By.id("saveBtn")).click();

        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Tên không được để trống')]")
        ));

        Assert.assertTrue(error.isDisplayed());
    }

    @Test
    public void TC_01_3_InvalidSpecialCharName() {
        driver.findElement(By.id("name")).sendKeys("Nguyễn @@@");
        driver.findElement(By.id("email")).sendKeys("bsSpecial@gmail.com");
        driver.findElement(By.id("spec")).sendKeys("Tai mũi họng");
        driver.findElement(By.id("saveBtn")).click();

        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Tên không được chứa ký tự đặc biệt')]")
        ));

        Assert.assertTrue(error.isDisplayed());
    }

    @Test
    public void TC_01_4_InvalidEmailFormat() {
        driver.findElement(By.id("name")).sendKeys("Bác sĩ Email");
        driver.findElement(By.id("email")).sendKeys("abc");
        driver.findElement(By.id("spec")).sendKeys("Răng hàm mặt");
        driver.findElement(By.id("saveBtn")).click();

        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Email sai định dạng')]")
        ));

        Assert.assertTrue(error.isDisplayed());
    }

    @Test
    public void TC_01_5_DuplicateEmail() {
        driver.findElement(By.id("name")).sendKeys("Bác sĩ C");
        driver.findElement(By.id("email")).sendKeys("test@gmail.com");  // email đã tồn tại
        driver.findElement(By.id("spec")).sendKeys("Da liễu");
        driver.findElement(By.id("saveBtn")).click();

        WebElement error = wait.until(ExpectedConditions.visibilityOfElementLocated(
                By.xpath("//*[contains(text(),'Email đã tồn tại')]")
        ));

        Assert.assertTrue(error.isDisplayed());
    }

    @Test
    public void TC_01_6_DangNhap_TaiKhoanBiKhoa() {
        driver.get("http://localhost:4200/login");

        driver.findElement(By.id("email")).sendKeys("doctor_locked@gmail.com");
        driver.findElement(By.id("password")).sendKeys("123456");
        driver.findElement(By.id("btnLogin")).click();

        WebElement alert = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("alertError"))
        );

        Assert.assertTrue(alert.getText().contains("bị khóa"));
    }

    @Test
    public void TC_01_7_DangNhap_ThieuMatKhau() {
        driver.get("http://localhost:4200/login");

        driver.findElement(By.id("email")).sendKeys("doctor@gmail.com");
        driver.findElement(By.id("btnLogin")).click();

        WebElement err = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("passwordError"))
        );

        Assert.assertEquals(err.getText(), "Vui lòng nhập mật khẩu");
    }

    @Test
    public void TC_01_8_DangNhap_SaiDinhDangEmail() {
        driver.get("http://localhost:4200/login");

        driver.findElement(By.id("email")).sendKeys("abc@@gmail..com");
        driver.findElement(By.id("password")).sendKeys("123456");

        WebElement err = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.id("emailError"))
        );

        Assert.assertTrue(err.getText().contains("định dạng"));
    }

    @Test
    public void TC_02_1_XemDanhSachBenhNhan() {
        driver.get("http://localhost:4200/doctor/patients");

        WebElement table =
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("patientTable")));

        Assert.assertTrue(table.isDisplayed());
    }

    @Test
    public void TC_02_2_TimKiemBenhNhan_SDT() {
        driver.get("http://localhost:4200/doctor/patients");

        driver.findElement(By.id("searchPhone")).sendKeys("0912345678");

        WebElement row = wait.until(
                ExpectedConditions.visibilityOfElementLocated(By.cssSelector("tr.result"))
        );

        Assert.assertTrue(row.getText().contains("0912345678"));
    }

    @Test
    public void TC_03_1_XemLichKham() {
        driver.get("http://localhost:4200/doctor/schedule");

        WebElement calendar =
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("doctorCalendar")));

        Assert.assertTrue(calendar.isDisplayed());
    }

    @Test
    public void TC_03_2_XemLichTheoNgay() {
        driver.get("http://localhost:4200/doctor/schedule");

        driver.findElement(By.id("datePicker")).sendKeys("2025-01-15");

        WebElement list =
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("scheduleList")));

        Assert.assertTrue(list.getText().contains("15/01/2025"));
    }

    @Test
    public void TC_04_1_CapNhatThongTin() {
        driver.get("http://localhost:4200/doctor/profile");

        WebElement name = driver.findElement(By.id("name"));
        name.clear();
        name.sendKeys("Bác sĩ A cập nhật");

        driver.findElement(By.id("btnSave")).click();

        WebElement success =
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alertSuccess")));

        Assert.assertTrue(success.getText().contains("thành công"));
    }

    @Test
    public void TC_05_1_DoiMatKhau_ThanhCong() {
        driver.get("http://localhost:4200/doctor/change-password");

        driver.findElement(By.id("oldPass")).sendKeys("123456");
        driver.findElement(By.id("newPass")).sendKeys("654321");
        driver.findElement(By.id("confirmPass")).sendKeys("654321");

        driver.findElement(By.id("btnChange")).click();

        WebElement success =
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alertSuccess")));

        Assert.assertTrue(success.getText().contains("đổi mật khẩu"));
    }

    @Test
    public void TC_05_2_DoiMatKhau_XacNhanSai() {
        driver.get("http://localhost:4200/doctor/change-password");

        driver.findElement(By.id("oldPass")).sendKeys("123456");
        driver.findElement(By.id("newPass")).sendKeys("654321");
        driver.findElement(By.id("confirmPass")).sendKeys("000000");

        driver.findElement(By.id("btnChange")).click();

        WebElement error =
                wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("alertError")));

        Assert.assertTrue(error.getText().contains("không khớp"));
    }
}
