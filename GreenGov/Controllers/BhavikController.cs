using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace GreenGov.Controllers
{
    public class BhavikController : Controller
    {
        // GET: Bhavik
        public ActionResult Index(string name)
        {
            return View();
        }
    }
}