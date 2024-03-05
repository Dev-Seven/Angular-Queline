import { FormControl, AbstractControl, ValidationErrors } from "@angular/forms";

export class ValidationService {
  static getValidatorErrorMessage(
    validatorName: string,
    validatorValue?: any,
    message?: string
  ) {
    let config: any = {
      required: `${message} Is Required`,
      invalidEmailAddress: "Invalid email address",
      minlength: `Minimum ${validatorValue.requiredLength} character`,
      mismatchedPassword: "Please Enter the Same Password as Above",
      mismatchedEmail: "Email is not matching",
      notSame: "Password not matching",
      onlyNumber: "Only numbers are allowed",
      onlyString: "Only string are allowed",
      min: `Minimum value ${validatorValue.min}`,
      max: `Maximum value ${validatorValue.max}`,
      minSelection: `Atleast select  ${validatorValue.min} ${message}`,
      invalidPhoneNumber: " Invalid Phone Number",
      maxlength: `Maximum length ${validatorValue.requiredLength}`,
      invalidPassword: `Password Must Be Minimum 6 Characters Long with At least 1 Upper Case, 1 Lower Case, 1 Special Character and 1 Digit.`,
      pattern:
        "Password Must Be Minimum 8 Characters Long with At least 1 Upper Case, 1 Lower Case, 1 Special Character and 1 Digit.",
      companyUnique: "Company name has been already registered",
      invalidName: "Company name should not contain '@'",
      emailUnique: "Email Id has been already registered",
      locationUnique: "Store Name is already registered",
    };

    return config[validatorName];
  }

  static emailValidator(control: any) {
    if (
      !control.value ||
      control.value.match(
        /[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?/
      )
    ) {
      return null;
    } else {
      return { invalidEmailAddress: true };
    }
  }
  static validName(control: any) {
    let invalidValue = [];
    let invalidChars = ["@"];
    invalidValue = invalidChars.filter((char) => control.value.includes(char));
    if (!control.value || invalidValue.length == 0) {
      return null;
    } else {
      return { invalidName: true };
    }
  }

  static passwordValidator(control: any) {
    if (
      !control.value ||
      control.value.match(
        "(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-zd$@$!%*?&].{5,}"
      )
    ) {
      return null;
    } else {
      return { invalidPassword: true };
    }
  }

  static compareNewPassword(control: any) {
    if (!control.root || !control.root.controls) {
      return null;
    }
    const exactMatch =
      control.root.controls.newPassword.value === control.value;
    return exactMatch ? null : { mismatchedPassword: true };
  }

  static comparePassword(control: any) {
    if (!control.root || !control.root.controls) {
      return null;
    }
    const exactMatch = control.root.controls.password.value === control.value;
    return exactMatch ? null : { mismatchedPassword: true };
  }

  static compareEmail(control: any) {
    if (!control.root || !control.root.controls) {
      return null;
    }
    const exactMatch = control.root.controls.email.value === control.value;
    return exactMatch ? null : { emailUnique: true };
  }

  static allowOnlyNumber(control: any) {
    if (control.value) {
      let tokenValue: number = control.value.toString().trim();
      if (!isNaN(tokenValue)) {
        return null;
      }

      return { onlyNumber: true };
    }
  }
  static allowOnlyString(control: any) {
    if (!control.value || control.value.match(/^[A-Z|a-z|" "]*$/)) {
      return null;
    } else {
      return { onlyString: true };
    }
  }

  static minSelectedCheckboxes(min: number) {
    return (control: FormControl) => {
      const totalSelected = (control.value as any[]).filter((x) => x);

      return totalSelected.length >= min
        ? null
        : { minSelection: { valid: false, min: min } };
    };
  }

  static phoneNoValidator(control: any) {
    if (!control.value || control.value.match(/^\(\d{3}\)\s\d{3}-\d{4}$/)) {
      return null;
    } else {
      return { invalidPhoneNumber: true };
    }
  }

  static companyUnique(control: any) {
    if (!control.root || !control.root.controls) {
      return null;
    }
    const exactMatchcompany =
      control.root.controls.companyName.value === control.value;

    return exactMatchcompany ? null : { companyUnique: true };
  }

  static locationUnique(control: any) {
    if (!control.root || !control.root.controls) {
      return null;
    }
    const exactMatchlocation =
      control.root.controls.name.value === control.value;
    return exactMatchlocation ? null : { locationUnique: true };
  }
}
