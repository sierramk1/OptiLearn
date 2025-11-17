import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import ImageGallery from './ImageGallery.jsx';

const final_review = `<br /> Throughout the project, I used Gemini CLI extensively for testing algorithms, creating visualizations, debugging, designing an application, and restructuring my project repository. This experience gave me a good sense of the strengths, weaknesses, and situations where Gemini is useful versus not so much.

<h3>Ease of setup and basic use.</h3>
I found the process of installing and setting up Gemini CLI to be easy. Although I could not use my school email for setup, it was relatively easy to link my personal google account. Also, it is easy to start Gemini once it is installed and set up, all it requires is a basic “gemini” command in the terminal. However, it will only have access to the files of the directory you call it in, so keep that in mind. For basic tasks—such as generating Python scripts, fixing little bugs, writing pseudocode, or running Git commands—it preforms extremely well. I like how Gemini usually tells you what it plans to do after you prompt it, and that it will ask for confirmation before running anything. This is nice for the user to understand what is being implemented and why, and makes the tool feel safer.

<h3>Strength in small, contained tasks.</h3>
Across all weeks, Gemini consistently excelled at:
* Fixing small coding mistakes
* Writing short functions
* Generating pseudocode and explanations
* Helping structure a project or suggest folder organization
* Converting between languages (Python → JS)
* Suggesting visualizations
* Explaining algorithms or concepts clearly

When the scope of the prompt was narrow and the file sizes were small, Gemini worked very well and often very fast.

<h3>Inconsistencies and fragility with larger files.</h3>
However, as the project grew in size and complexity, Gemini struggled. Larger files or multi-file updates often triggered issues such as:
* Editing the wrong file or using incorrect file paths
* Failing to generate valid JSON for Jupyter notebooks
* Switching strategies mid-task (falling back to writing code through a Python script)
* Breaking or emptying files without acknowledging touching them
* Producing partial updates when the file was too long to process
* Getting “stuck” or looping when the model fell back to the default (non-Pro) mode

A pretty upsetting issue I ran into was file corruption. Several times I noticed files in my project being emptied despite there being no log of Gemini editing them, and Gemini refusing to admit it touched them. After reproaching online, I found reports from other users who experienced similar problems, which confirmed that these issues were not unique to me. This did significantly reduce my trust in using Gemini on large or important directories. 

<h3>Session limitations and memory issues.</h3>
Gemini also lacks memory across sessions unless you explicitly save instructions via the save-memory tool. This does slow down the process when you are working on a big task across several days, as each time Gemini is started it must read the files or catch up on what you are working on. At times I found that the save-memory tool wasn’t working either. While a fix to the memory issue seems like it would be to keep the Gemini session open, in the free version there is a daily limit in the pro model. As projects get bigger and tasks more complex, this daily limit runs out quite fast and the fallback/default model is significantly worse. It often gets stuck in loops, can’t solve moderate tasks, and fails at debugging.

<h3>Where Gemini excels.</h3>
Despite these limitations, Gemini has some standout moments:
* When I transitioned my project from backend + frontend to frontend-only, Gemini completed what it estimated to be “2–3 days of work” in about 30 minutes.
* It explained debugging techniques (especially console logs) in a way that genuinely improved my own understanding.
* It helped create meaningful algorithmic visualizations, handle edge cases, and restructure large portions of the project quickly

<h3>Overall impression.</h3>
My overall experience is that Gemini CLI is a powerful tool under the right circumstances. It is excellent for:
* Small coding tasks
* File creation
* Quick testing and debugging
* Conceptual explanations
* Simple visualizations
* Git assistance

However, it struggles with:
* Large files
* Updates that span multiple files or are very complex
* Complex project structure 
* A reliable fallback model

Given the risk of file deletion and its difficulty handling large files, I would not recommend using Gemini CLI directly on large, important, or irreplaceable project directories. Instead, I would suggest using it in smaller, subfolders.

Despite the frustrations using Gemini at times, this project did give me a meaningful insight into how AI-assisted software development works and how to collaborate meaningfully with AI.
`;

const week1_log = `This week, the project goals were:
-- Design system architecture: define the structure for algorithm implementations, visualization frontend, and necessary backend components
-- Structure Github repository with named folders for algorithms, notebooks, visualizations, and documentation and README with project goals and instructions to follow along
-- Install and learn Gemini CLI: explore its capabilities for visualization, UI generation, etc	

The following was accomplished:
The system architecture is outlined in the README file, and the corresponding folders were added to the repository. Gemini CLI was easy to install and setup with my personal google account, but not possible with umich accounts. It works great for git commands and tells you how to run scripts it writes. When you ask it to complete something it will suggest a solution and then ask if it can be implemented or if you would like to modify it, which is helpful. Sometimes it accidentally tries to edit the wrong file or uses the wrong file path, so you still have to be careful and read what it is attempting to do. I messed it up once because I had "&" in a file name and it struggled to move the file because of the special character. Overall, I asked it several basic prompts to test its capabilities and it excelled very well at these. 

These are the prompts I asked it:
Write a Python function that computes the factorial of a number using recursion.

def add_numbers(a, b):
    return a - b
Find the bug and correct the function so it returns the sum.
Write docstring for this function explaining its inputs and outputs.

Create a Python script that plots y = x^2 for x from -10 to 10 using matplotlib.
Modify the plot to allow user input for the function to plot.

Write pseudocode for the bisection method for finding roots of a function.
Explain how gradient descent works in simple terms.`;

const week2_log = `This week the project goals focused around algorithm implementations, specifically to implement the one-dimensional algorithms: Bisection, Secant, Newton-Raphson, Golden Search in Python, to test them in Jupyter notebooks and compare to existing Python packages (like SciPy), and to use GenAI to implement basic visualization plots with Plotly for each algorithm’s output.

I began with implementing the one-dimensional algorithms, and then prompted Gemini to create a Jupyter Notebook to test the algorithms with SciPy and NumPy. I did run into some problems with Gemini creating the testing notebook as it failed to properly format the file as a JSON. I fed it the error message that Jupyter told me and continued to fail to produce a working notebook 3 more times. At one point, it decided to write a python script to create the Jupyter notebook and this still failed. Finally, it decided to create the python script line by line, which was incredibly slow and BLANK. This whole error process took about 20 minutes, before Gemini completely broke and glitched out. I decided to create the notebook myself and see if Gemini could still write the code to check the algorithms. Which it did, but it wanted me to add the code manually to the Jupyter notebook in fear of messing it up again. Images of the error process and work through can be found in screenshots/week2. 

The notebook can be found in the testing_notebooks folder, and the results showed that my implementations were correct against SciPy and NumPy using well-known example functions and results taken from the literature in the project proposal. However, I spent quite some time debugging the test and ran across an interesting fact about SciPy's Golden Search which is that it does not strictly enforce the bracket boundaries. I also decided to format my screenshots by weeks for organization.

I attempted to create basic animated visualizations of the one-dimensional algorithms from this week with Gemini CLI. At first, we had a few discussions about why it is important to visualize the algorithms in matplotlib before the final interactive web application, so we can understand what exactly should be visualized or interactive. For example, with the bisection and secant method, Gemini suggested redefining my algorithm to yield the values of a, b, and mid (or x0, x1, x2) each iteration. 

Additionally, for bisection, I asked Gemini what it thinks should happen if one of the roots is given as one of the input values, to which it suggested adding an edge case check for this at the beginning, instead of erroring out. This update was added to the Secant visualization file too. In the Newton-Raphson, the animation that Gemini produced was good, but it showed the tangent line only going in one direction, which felt less intuitive that it is a tangent line not just an arrow to 0. Therefore, I prompted Gemini to fix this, and it did. Also for golden search, I ran into some problems with the requirement of the input function to be unimodal, which is too difficult and costly to check in the algorithm, therefore if I allow users to input functions in the app, it must be clear that they can only input unimodal functions or else it will fail. The golden search visualization I spent quite some time with, as one of the functions kept failing despite passing in the testing notebook, and I was trying to work with Gemini to craft a way to show the 38.2% reduction in bracketing that defines Golden Search. I ended up not liking any of Gemini’s suggestions, and prompted it to shade the 38.2% versus the rest to showcase it, which turned out much more intuitive and clear. The final visualizations can be found in the visualizations folder, inside the one-dimensional folder.`;

const week3_log = `I had some change of plans this week as I had to reorganize my plan for hosting and developing the application. I decided to host it on render using a flask with javascript backend and react frontend. This meant I added a backend folder and converted my algorithm files from python to javascript with Gemini. I also had Gemini create a Node.js file to test the algorithmic implementations for the multi-dimensional algorithms against SciPy, which can be found in the screenshots folder under week 3. 

After these algorithm steps, I moved onto setting up React and Flask. Gemini was very helpful at explaining how to install and get everything set up, but I found that running installation commands was more simple in a separate terminal where I could see what was going on, as Gemini doesn’t send feedback until its done running so I wasn’t sure what was happening. Gemini made a little typo at some point deleting files but it caught it by itself. With the help of Gemini, I was able to get the application working with a basic Plotly graph and the 6 algorithms with a single function root test for each.

Some other things I learned this week is that Gemini has no memory of past conversations, as each session is independent and knowledge based on the current conversation only. However, there is a save-memory tool that allow Gemini to remember specific facts, I used it to have Gemini no longer add prefixes to commit messages.

Additionally, Gemini is pretty nice in that it can surf the web if you have current relevant questions. I asked it for the news from the previous day and it easily pulled up information. Found in screenshot Gemini_week3_websurfing. However, if you leave a session for a long time like I did, it can only surf the web from the day before the session started so the longer the session is open the more out of date its information can be.

Later in the week, I spent some more time with Gemini developing the interactivity of the application. I did run into a problem when I asked Gemini to update a file with code it suggested, it seems the code to update the file was too large fro Gemini to process in a single command so it defaulted to creating a python script to write to the original file. This method proved to be more stable for creating the JavaScript files, but it is another few steps that Gemini has to take, and they must be approved of. I think this supports my general feelings that Gemini is very helpful but more so for small changes, bugs, maybe Git commands, and not so much writing lots of code. Once I got bisection working as I wanted, I implemented Golden Search which was much easier now that Gemini knew what worked and didn’t. I will also credit Gemini for remembering how I wanted to visualize the golden ratio in the graph from the Jupyter notebook we worked on, but this was because I never terminated the session. However, I ran into the same problem a lot this week where Gemini wanted to update an algorithmic visualization we already had worked on, despite numerous explanations that it was already done.`;

const week4_log = `I spent lots of time with the user interface for the one-dimensional algorithms last week, and had planned to move onto multi-dimensional algorithms but first ended up spending more time with the one-dimensional to get the backend working.

I decided to implement the backend for both one dimensional and multidimensional algorithms because I felt it would make the application more applicable and interesting. I started with the one-dimensional, and worked with Gemini to develop a plan to get the backend server running and one that that would be compatible with Vercel as I was using that to host my app prior.

While I ran into many problems with the server, Gemini was helpful in trying different diagnostic tests to figure out what was causing the problem. I will say that Gemini ran out of the daily limit of the advanced model and was forced to sue the fallback mode, which definitely is not as talented or intelligent as the more advanced model. I was still trying to get the backend serve to connect to my frontend when Gemini switched and I could tell how much slower the default model is and how susceptible it is to getting stuck. 

Gemini is definitely still very helpful, but as my files get longer and the project more complicated, it struggles. This reinforces my feelings that Gemini is great for  small coding tasks or designing/structuring projects, but it has its limitations.

At the end of the week, Gemini and I had the backend connected to the frontend. Additionally we adopted the one-dimensional pages to allow users to switch between function vs data. The function mode works as previously, but the data mode allows them to input a csv, to which the program runs cubic spline interpolation on, and then finds the root according to whichever algorithm. I am glad to have the one-dimensional algorithms fully done, and I look forward to working on the multi-dimensional algorithms visualizations next week!`;

const week5_log = `This week I chose to pivot back to the algorithms to work on visualizing the two multidimensional algorithms.
	I replicated much of the structure of the one-dimensional algorithms page, with function input, initial guess, and algorithmic specific details, as well as the number of dimensions.In the gradient descent algorithm in multiple dimensions, I chose to visualize this by showing the path the algorithm takes across the function’s surface. Since the function now has more than one input variable, I use a contour plot (or 3D surface plot) to represent the function’s landscape. The algorithm’s iterations are overlaid as points or arrows to show how it moves toward the minimum. This allows users to see not only the convergence behavior but also the trajectory through the “valleys” and “ridges” of the function. I also included a pseudocode display so that users can connect the visual path with the underlying computational steps, making the algorithm’s behavior clear in higher dimensions.
	For functions or data greater than three dimensions, I chose to show convergence plots and tables of iteration coordinates, so users can track the algorithm’s progress even when it’s not possible to visualize all dimensions at once.I ran into some interesting errors with Gemini, specifically a use of NOOP, no-operation command that forced me to allow it to be run despite telling Gemini to stop using that. NOOP was just a no operation command that allowed Gemini to print something to me, but generally in the past few weeks Gemini could just speak to me without needing permission for a NOOP command. This was completely new to me, and I attempted to stop it by using the save-memory command to tell Gemini not to use it, but Gemini would not save this fact to memory, despite me feeding the save-memory command and details several times. 
	I will say that when I transitioned my project from backend to frontend only this week, Gemini was very helpful. I asked it how long it expected this process to take and it estimated 2-3 days of work, but it only took Gemini about 30 minutes to convert the necessary files, restructure the project, and update other dependent files. This impressed me, and felt like a great use of Gemini to accomplish a complicated task in a short amount of time. Also, I think one of the benefits of collaborating with Gemini is that I have learned more about how to debug an application by using console logs. I would have never known how to work through many of the problems I have encountered with Gemini, but to learn how Gemini handles them has been incredibly beneficial.
	At some point we were working through a bug in the frontend and when I went to check the files in VSCode, and they were empty. I accused Gemini of corrupting the files, but it denied touching those files.  This came up multiple times this week with several different files. I am not sure if it is related to the fallback/default version of Gemini used when I hit my limit of the pro for the day but it is quite frustrating, and a major con of using Gemini.  Moreover,  I did some personal research into this problem to see if it really was Gemini that seemed to empty my files without ever asking me or claiming to have touched those files. I found some interesting articles about people losing all of their files thanks to Gemini CLI, which is truly awful for them, but nice to know I wasn’t alone in this problem. This has led me to believe that it is best to use Gemini CLI in a smaller directory you want to work on, instead of an entire project or your whole Desktop. In general, I have lost trust in Gemini.
The article and forum I found:<br /><a href="https://news.ycombinator.com/item?id=44651485" target="_blank" rel="noopener noreferrer">https://news.ycombinator.com/item?id=44651485</a><br /><a href="https://dev.ua/en/news/ya-povnistiu-i-katastrofichno-pidviv-vas-1753427615" target="_blank" rel="noopener noreferrer">https://dev.ua/en/news/ya-povnistiu-i-katastrofichno-pidviv-vas-1753427615</a>`;

const logs = [
  { id: 'final_review', title: 'Final Review of Gemini CLI', content: final_review, images: [] },
  { id: 'week1', title: 'Week 1', content: week1_log, images: ['gemini_basicPlot.png', 'gemini_closing.png', 'gemini_factorial.png', 'gemini_mistake&userInput.png', 'gemini_opening.png'] },
  { id: 'week2', title: 'Week 2', content: week2_log, images: ['gemini_creatingTests.png', 'gemini_error1.png', 'gemini_error2.png', 'gemini_error3.png', 'gemini_error4.png', 'gemini_error5.png'] },
  { id: 'week3', title: 'Week 3', content: week3_log, images: ['Gemini_week3_firststepofwebsite.png', 'Gemini_week3_problemwithfile.png', 'Gemini_week3_settingupReactFlask.png', 'Gemini_week3_suggestions.png', 'Gemini_week3_testingalgos.png', 'Gemini_week3_typo.png', 'Gemini_week3_websurfing.png'] },
  { id: 'week4', title: 'Week 4', content: week4_log, images: ['gemini_week4_noop_fixAttempt.png', 'gemini_week5_noop_error.png'] },
  { id: 'week5', title: 'Week 5', content: week5_log, images: [] },
];

const BlogPage = () => {
  const scrollToWeek = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div style={{
      backgroundColor: '#F4F2EF',
      fontFamily: 'Roboto, Arial, sans-serif',
      minHeight: '100vh',
    }}>
      <AppBar 
        position="static" 
        sx={{
          backgroundColor: '#FFF5E6',
          height: '77px',
          boxShadow: 'none',
          borderBottom: '1px solid #ccc'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', padding: '0 20px' }}>
          <Link 
            to="/" 
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <img 
              src="/character.png" 
              alt="Owl Character" 
              style={{ maxWidth: '50px', height: 'auto', marginRight: '10px' }} 
            />
            <Typography
              variant="h4"
              sx={{
                color: '#72A8C8',
                fontFamily: 'Roboto',
                fontWeight: '700',
                fontSize: '38px',
                lineHeight: '100%',
                letterSpacing: '0%',
                textAlign: 'center',
                cursor: 'pointer'
              }}
            >
              OptiLearn
            </Typography>
          </Link>
          <Box sx={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            {logs.map(log => (
              <Button
                key={log.id}
                onClick={() => scrollToWeek(log.id)}
                sx={{
                  color: '#666',
                  fontSize: '1.2em',
                  fontWeight: 'normal',
                  textDecoration: 'none',
                  textTransform: 'none',
                  minWidth: '100px',
                  padding: '0',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    textDecoration: 'underline'
                  }
                }}
              >
                {log.title}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </AppBar>
      <div className="container mx-auto p-4" style={{ paddingTop: '20px', marginLeft: '100px', marginRight: '100px' }}>
        {logs.map(log => (
          <div key={log.id} id={log.id} style={{ marginBottom: '40px' }}>
            <h2 className="text-2xl font-bold mb-2">{log.title}</h2>
            <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'Roboto, Arial, sans-serif', fontSize: '1em' }} dangerouslySetInnerHTML={{ __html: log.content }} />
            {log.images.length > 0 && <ImageGallery week={log.id.replace('week', '')} images={log.images} />}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;

