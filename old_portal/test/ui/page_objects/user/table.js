var tableHeaderLocators = {
  firstName: {
    css: 'th:nth-of-type(1) a'
  },
  lastName: {
    css: 'th:nth-of-type(2) a'
  },
  email: {
    css: 'th:nth-of-type(3) a'
  },
  role: {
    css: 'th:nth-of-type(4) a'
  }
};

var tableRowLocators = {
  firstName: {
    css: 'td:nth-of-type(1)'
  },
  lastName: {
    css: 'td:nth-of-type(2)'
  },
  email: {
    css: 'td:nth-of-type(3)'
  },
  role: {
    css: 'td:nth-of-type(4)'
  },
  actions: {
    css: 'td:nth-of-type(5)',
    buttons: {
      pencil: {
        className: 'glyphicon-pencil'
      },
      trash: {
        className: 'glyphicon-trash'
      }
    }
  }
};

var TableRow = function (rowEl, locators) {

  // Properties
  this.rowEl = rowEl;
  this.locators = locators;

  // Methods
  this.getFirstNameCell = function () {
    return this.rowEl.element(by.css(this.locators.firstName.css));
  };

  this.getLastNameCell = function () {
    return this.rowEl.element(by.css(this.locators.lastName.css));
  };

  this.getEmailCell = function () {
    return this.rowEl.element(by.css(this.locators.email.css));
  };

  this.getRoleCell = function () {
    return this.rowEl.element(by.css(this.locators.role.css));
  };

  this.getFirstName = function () {
    return this
      .getFirstNameCell()
      .getText();
  };

  this.getLastName = function () {
    return this
      .getLastNameCell()
      .getText();
  };

  this.getEmail = function () {
    return this
      .getEmailCell()
      .getText();
  };

  this.getRole = function () {
    return this
      .getRoleCell()
      .getText();
  };

  this.clickFirstName = function () {
    return this
      .getFirstNameCell()
      .click();
  };

  this.clickLastName = function () {
    return this
      .getLastNameCell()
      .click();
  };

  this.clickEmail = function () {
    return this
      .getEmailCell()
      .click();
  };

  this.clickRole = function () {
    return this
      .getRoleCell()
      .click();
  };

  if (this.locators.actions && this.locators.actions.buttons.pencil) {

    this.getEditBtn = function () {
      return this.rowEl
        .element(by.css(this.locators.actions.css))
        .element(by.className(this.locators.actions.buttons.pencil.className));
    };

    this.clickEdit = function () {
      return this
        .getEditBtn()
        .click();
    };
  }

  if (this.locators.actions && this.locators.actions.buttons.trash) {

    this.getDeleteBtn = function () {
      return this.rowEl
        .element(by.css(this.locators.actions.css))
        .element(by.className(this.locators.actions.buttons.trash.className));
    };

    this.clickDelete = function () {
      return this
        .getDeleteBtn()
        .click();
    };
  }
};

var UserTable = {

  locators: {
    header: {
      css: 'table thead tr'
    },
    rows: {
      repeater: 'user in records'
    }
  },

  getHeaderEl: function () {
    return element(by.css(this.locators.header.css));
  },

  getHeader: function () {
    var header = this.getHeaderEl();
    return new TableRow(header, tableHeaderLocators);
  },

  getRows: function () {
    return element.all(by.repeater(this.locators.rows.repeater));
  },

  getFirstRow: function () {
    return this.getRow(0);
  },

  getRow: function (rowIndex) {
    var el = this
      .getRows()
      .get(rowIndex);
    return new TableRow(el, tableRowLocators);
  }
};

module.exports = UserTable;