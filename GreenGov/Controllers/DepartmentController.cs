using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GreenGov.Controllers
{
    public class DepartmentController : Controller
    {
        // GET: Department
        public ActionResult Index(int id)
        {
            return View(id);
        }
    }
}